export type UseCaseProtocol<Input, Output> = {
  execute(input: Input): Promise<Output>;
}