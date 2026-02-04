export type MapperProtocol<DomainEntity, PersistenceModel> = {
    toDomain(raw: PersistenceModel): DomainEntity;
    toPersistence(entity: DomainEntity): PersistenceModel;
}