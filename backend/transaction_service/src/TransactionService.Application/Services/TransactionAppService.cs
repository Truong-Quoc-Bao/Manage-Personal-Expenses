using TransactionService.Core.Interfaces;
using TransactionService.Core.DTOs;
using TransactionService.Core.Entities;
using AutoMapper;

namespace TransactionService.Application.Services
{
    public class TransactionAppService : ITransactionService
    {
        private readonly ITransactionRepository _transactionRepository;
        private readonly IRabbitMQPublisher _rabbitMQPublisher;
        private readonly IAccountInternalService _accountInternalService;
        private readonly ICategoryInternalService _categoryInternalService;
        private readonly IMapper _mapper;

        public TransactionAppService(ITransactionRepository transactionRepository, IMapper mapper, IRabbitMQPublisher rabbitMQPublisher, IAccountInternalService accountInternalService, ICategoryInternalService categoryInternalService)
        {
            _transactionRepository = transactionRepository;
            _rabbitMQPublisher = rabbitMQPublisher;
            _accountInternalService = accountInternalService;
            _categoryInternalService = categoryInternalService;
            _mapper = mapper;
        }

        public async Task<PaginatedResultDto<TransactionResponseDto>> GetAllTransactionsAsync(Guid userId, TransactionFilterParams filters, bool includeDetails = false)
        {
            var (transactions, totalCount) = await _transactionRepository.GetAllTransactionsAsync(userId, filters);
            var transactionDtos = _mapper.Map<List<TransactionResponseDto>>(transactions);

            if (includeDetails && transactionDtos.Count > 0)
            {
                await ApplyCategoryDetailsAsync(userId, transactions, transactionDtos);
                await ApplyAccountDetailsAsync(userId, transactions, transactionDtos);
            }

            return new PaginatedResultDto<TransactionResponseDto>
            {
                Items = transactionDtos,
                TotalCount = totalCount,
                Page = filters.Page,
                PageSize = filters.PageSize
            };
        }

        public async Task<TransactionResponseDto?> GetTransactionByIdAsync(Guid userId, Guid transactionId, bool includeDetails = false)
        {
            var transaction = await _transactionRepository.GetTransactionByIdAsync(userId, transactionId);
            if (transaction == null)
            {
                return null;
            }

            var dto = _mapper.Map<TransactionResponseDto>(transaction);
            if (includeDetails)
            {
                if (transaction.CategoryId.HasValue)
                {
                    var info = await _categoryInternalService.GetCategoryDisplayAsync(
                        transaction.CategoryId.Value,
                        userId,
                        transaction.TransactionType.ToString());
                    if (info.Found)
                    {
                        dto.CategoryName = info.CategoryName;
                        dto.CategoryColor = info.Color;
                        dto.CategoryIconCode = info.IconCode;
                    }
                }

                var accountInfo = await _accountInternalService.GetAccountDisplayAsync(transaction.AccountId, userId);
                if (accountInfo.Found)
                {
                    dto.AccountName = accountInfo.AccountName;
                }
            }

            return dto;
        }

        public async Task<TransactionResponseDto> CreateTransactionAsync(Guid userId, CreateTransactionRequestDto request)
        {
            var transactionEntity = _mapper.Map<Transaction>(request);
            transactionEntity.UserId = userId;

            var accountCheck = await _accountInternalService.ValidateAccountAsync(transactionEntity.AccountId, userId);
            var categoryCheck = true;

            if(transactionEntity.CategoryId != null)
            {
                categoryCheck = await _categoryInternalService.ValidateCategoryAsync(transactionEntity.CategoryId.Value, userId, transactionEntity.TransactionType.ToString());
            }

            if(accountCheck && categoryCheck)
            {
                var createdTransaction = await _transactionRepository.CreateTransactionAsync(transactionEntity);
                var transactionEventDto = _mapper.Map<CreateTransactionEventDto>(createdTransaction);

                await _rabbitMQPublisher.PublishAsync(transactionEventDto, "transaction.created");
                return _mapper.Map<TransactionResponseDto>(createdTransaction);
            }

            throw new Exception("Invalid transaction details");
        }

        public async Task<TransactionResponseDto> UpdateTransactionAsync(Guid userId, Guid transactionId, UpdateTransactionRequestDto request)
        {
            var transactionEntity = _mapper.Map<Transaction>(request);
            transactionEntity.TransId = transactionId;
            transactionEntity.UserId = userId;

            var accountCheck = await _accountInternalService.ValidateAccountAsync(transactionEntity.AccountId, userId);
            var categoryCheck = true;

            if(transactionEntity.CategoryId != null)
            {
                categoryCheck = await _categoryInternalService.ValidateCategoryAsync(transactionEntity.CategoryId.Value, userId, transactionEntity.TransactionType.ToString());
            }

            if(accountCheck && categoryCheck)
            {
                var beforeUpdate = await _transactionRepository.GetTransactionByIdAsync(userId, transactionId);
                if (beforeUpdate == null)
                {
                    throw new Exception("Transaction not found");
                }

                var oldAmount = beforeUpdate.Amount;
                var oldType = beforeUpdate.TransactionType;
                var oldAccountId = beforeUpdate.AccountId;

                var updatedTransaction = await _transactionRepository.UpdateTransactionAsync(userId, transactionId, transactionEntity);
                if (updatedTransaction == null)
                {
                    throw new Exception("Transaction not found");
                }

                var balanceAffectingChange =
                    oldAmount != transactionEntity.Amount
                    || oldType != transactionEntity.TransactionType
                    || oldAccountId != transactionEntity.AccountId;

                if (balanceAffectingChange)
                {
                    var updateEventDto = new UpdateTransactionEventDto
                    {
                        TransId = transactionId,
                        UserId = userId,
                        AccountId = oldAccountId,
                        AccountIdUpdate = transactionEntity.AccountId,
                        CategoryId = transactionEntity.CategoryId,
                        Amount = oldAmount,
                        AmountUpdate = transactionEntity.Amount,
                        TransactionType = oldType.ToString(),
                        TransactionTypeUpdate = transactionEntity.TransactionType.ToString(),
                        Description = transactionEntity.Description,
                        Date = transactionEntity.Date,
                        Note = transactionEntity.Note
                    };

                    await _rabbitMQPublisher.PublishAsync(updateEventDto, "transaction.updated");
                }

                return _mapper.Map<TransactionResponseDto>(updatedTransaction);
            }

            throw new Exception("Invalid transaction details");
        }

        public async Task<TransactionResponseDto> DeleteTransactionAsync(Guid userId, Guid transactionId)
        {
            var transactionEntity = await _transactionRepository.DeleteTransactionAsync(userId, transactionId);

            var deleteEventDto = _mapper.Map<DeleteTransactionEventDto>(transactionEntity);
            await _rabbitMQPublisher.PublishAsync(deleteEventDto, "transaction.deleted");

            return _mapper.Map<TransactionResponseDto>(transactionEntity);
        }

        private async Task ApplyCategoryDetailsAsync(
            Guid userId,
            IReadOnlyList<Transaction> entities,
            List<TransactionResponseDto> dtos)
        {
            var pairs = entities.Zip(dtos, (e, d) => (Entity: e, Dto: d))
                .Where(x => x.Entity.CategoryId.HasValue)
                .ToList();
            var distinctIds = pairs.Select(x => x.Entity.CategoryId!.Value).Distinct().ToList();
            var cache = new Dictionary<Guid, CategoryDisplayDto>();
            foreach (var categoryId in distinctIds)
            {
                var sample = pairs.First(x => x.Entity.CategoryId == categoryId).Entity;
                var info = await _categoryInternalService.GetCategoryDisplayAsync(
                    categoryId,
                    userId,
                    sample.TransactionType.ToString());
                cache[categoryId] = info;
            }

            foreach (var p in pairs)
            {
                var id = p.Entity.CategoryId!.Value;
                if (!cache.TryGetValue(id, out var info) || !info.Found)
                {
                    continue;
                }

                p.Dto.CategoryName = info.CategoryName;
                p.Dto.CategoryColor = info.Color;
                p.Dto.CategoryIconCode = info.IconCode;
            }
        }

        private async Task ApplyAccountDetailsAsync(
            Guid userId,
            IReadOnlyList<Transaction> entities,
            List<TransactionResponseDto> dtos)
        {
            var distinctAccountIds = entities.Select(e => e.AccountId).Distinct().ToList();
            var cache = new Dictionary<Guid, AccountDisplayDto>();

            foreach (var accountId in distinctAccountIds)
            {
                var info = await _accountInternalService.GetAccountDisplayAsync(accountId, userId);
                cache[accountId] = info;
            }

            for (int i = 0; i < entities.Count; i++)
            {
                if (cache.TryGetValue(entities[i].AccountId, out var info) && info.Found)
                {
                    dtos[i].AccountName = info.AccountName;
                }
            }
        }
    }
}
