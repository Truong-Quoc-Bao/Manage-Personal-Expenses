using TransactionService.Core.Entities;
using TransactionService.Core.DTOs;
using AutoMapper;

namespace TransactionService.Application.Mappings
{
    public class AutoMapperTransaction : Profile
    {
        public AutoMapperTransaction()
        {
            CreateMap<Transaction, TransactionResponseDto>().ReverseMap();
            CreateMap<CreateTransactionRequestDto, Transaction>().ReverseMap();
                // .ForMember(dest => dest.TransactionType, opt => opt.MapFrom(src => Enum.Parse<TransactionType>(src.TransactionType, true)))
            CreateMap<CreateTransactionResponseDto, Transaction>().ReverseMap();
            CreateMap<CreateTransactionEventDto, Transaction>().ReverseMap();
            CreateMap<UpdateTransactionRequestDto, Transaction>().ReverseMap();
                // .ForMember(dest => dest.TransactionType, opt => opt.MapFrom(src => Enum.Parse<TransactionType>(src.TransactionType, true)))
            CreateMap<UpdateTransactionEventDto, Transaction>().ReverseMap();
            CreateMap<DeleteTransactionEventDto, Transaction>().ReverseMap();

        }
    }
}