export interface ViewModelOperations<IViewModel, IOperations> {
    model: IViewModel;
    operations: IOperations;
}

export interface UseCase<IDependency, IViewModel, IOperations> {
    (dependencies: IDependency): ViewModelOperations<IViewModel, IOperations>;
}
