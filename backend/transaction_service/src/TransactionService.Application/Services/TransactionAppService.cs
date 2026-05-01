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

        public async Task<List<TransactionResponseDto>> GetAllTransactionsAsync(Guid userId)
        {
            var transactions = await _transactionRepository.GetAllTransactionsAsync(userId);
            // Map transactions to TransactionResponseDto
            var transactionDtos = _mapper.Map<List<TransactionResponseDto>>(transactions);

            return transactionDtos;
        }

        public async Task<TransactionResponseDto> GetTransactionByIdAsync(Guid userId, Guid transactionId)
        {
            var transaction = await _transactionRepository.GetTransactionByIdAsync(userId, transactionId);
            return _mapper.Map<TransactionResponseDto>(transaction);
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
    }
}   