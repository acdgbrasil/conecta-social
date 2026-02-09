export type UseCasePort<Input, Output> = {
  execute(input: Input): Promise<Output>;
}