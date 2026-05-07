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

        public async Task<List<TransactionResponseDto>> GetAllTransactionsAsync(Guid userId, Guid? categoryId = null, bool includeCategoryDetails = false)
        {
            var transactions = await _transactionRepository.GetAllTransactionsAsync(userId, categoryId);
            var transactionDtos = _mapper.Map<List<TransactionResponseDto>>(transactions);
            if (includeCategoryDetails && transactionDtos.Count > 0)
            {
                await ApplyCategoryDetailsAsync(userId, transactions, transactionDtos);
            }

            return transactionDtos;
        }

        public async Task<TransactionResponseDto?> GetTransactionByIdAsync(Guid userId, Guid transactionId, bool includeCategoryDetails = false)
        {
            var transaction = await _transactionRepository.GetTransactionByIdAsync(userId, transactionId);
            if (transaction == null)
            {
                return null;
            }

            var dto = _mapper.Map<TransactionResponseDto>(transaction);
            if (includeCategoryDetails && transaction.CategoryId.HasValue)
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

            return dto;
        }

        public async Task<TransactionResponseDto> CreateTransactionAsync(Guid userId, CreateTransactionRequestDto request)
        {
            var transactionEntity = _mapper.Map<Transaction>(request);

            var accountCheck = await _accountInternalService.ValidateAccountAsync(transactionEntity.AccountId, userId);
            var categoryCheck = true;

            if(transactionEntity.CategoryId != null)
            {
                categoryCheck = await _categoryInternalService.ValidateCategoryAsync(transactionEntity.CategoryId.Value, userId, transactionEntity.TransactionType.ToString());
            }

            if(accountCheck && categoryCheck)
            {
                var createdTransaction = await _transactionRepository.CreateTransactionAsync(transactionEntity);
                await _rabbitMQPublisher.PublishAsync(_mapper.Map<CreateTransactionEventDto>(createdTransaction), "transaction.created");
                return _mapper.Map<TransactionResponseDto>(createdTransaction);
            }

            throw new Exception("Invalid transaction details");
        }

        public async Task<TransactionResponseDto> UpdateTransactionAsync(Guid userId, Guid transactionId, UpdateTransactionRequestDto request)
        {
            var transactionEntity = _mapper.Map<Transaction>(request);
            transactionEntity.TransId = transactionId;

            var accountCheck = await _accountInternalService.ValidateAccountAsync(transactionEntity.AccountId, userId);
            var categoryCheck = true;

            if(transactionEntity.CategoryId != null)
            {
                categoryCheck = await _categoryInternalService.ValidateCategoryAsync(transactionEntity.CategoryId.Value, userId, transactionEntity.TransactionType.ToString());
            }

            if(accountCheck && categoryCheck)
            {
                
                var updatedTransaction = await _transactionRepository.UpdateTransactionAsync(userId, transactionId, transactionEntity);
                if (updatedTransaction == null)
                {
                    throw new Exception("Transaction not found");
                }

                updatedTransaction.Amount = transactionEntity.Amount - updatedTransaction.Amount;

                await _rabbitMQPublisher.PublishAsync(_mapper.Map<UpdateTransactionEventDto>(updatedTransaction), "transaction.updated");
                return _mapper.Map<TransactionResponseDto>(updatedTransaction);
            }

            throw new Exception("Invalid transaction details");
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
    }
}   