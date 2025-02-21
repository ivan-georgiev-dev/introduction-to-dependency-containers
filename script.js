function createDependencyContainer() {
  const registrations = {};

  function register(id, dependencies, factory) {
    registrations[id] = {
      id,
      dependencies,
      factory,
    };
  }

  function resolve(id) {
    const registration = registrations[id];

    if (!registration) {
      throw new Error('No registration with ID ' + id + ' found.');
    }

    const { dependencies, factory } = registration;

    if (dependencies.length === 0) {
      return factory();
    }

    const resolvedDependencies = dependencies.map((dependency) =>
      resolve(dependency),
    );

    return factory(resolvedDependencies);
  }

  return {
    register,
    resolve,
  };
}

class TodoApiService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async getTodo(id) {
    const response = await fetch(`${this.baseUrl}/todos/${id}`);

    const todo = await response.json();

    return todo;
  }
}

class TodoService {
  constructor(todoApiService, todoFormatter) {
    this.todoApiService = todoApiService;
    this.todoFormatter = todoFormatter;
  }

  async getFormattedTodos(ids) {
    const todos = await Promise.all(
      ids.map((id) => this.todoApiService.getTodo(id)),
    );

    return todos.map((todo) => this.todoFormatter.format(todo));
  }
}

class TodoFormatter {
  format(todo) {
    return todo.title + ' - ' + (todo.completed ? 'done.' : 'not done.');
  }
}

const dependencyContainer = createDependencyContainer();

dependencyContainer.register(
  'baseUrl',
  [],
  () => 'https://jsonplaceholder.typicode.com',
);

dependencyContainer.register(
  'TodoApiService',
  ['baseUrl'],
  ([baseUrl]) => new TodoApiService(baseUrl),
);

dependencyContainer.register('TodoFormatter', [], () => new TodoFormatter());

dependencyContainer.register(
  'TodoService',
  ['TodoApiService', 'TodoFormatter'],
  ([todoApiService, todoFormatter]) =>
    new TodoService(todoApiService, todoFormatter),
);

const todoService = dependencyContainer.resolve('TodoService');
todoService
  .getFormattedTodos([1, 2, 3])
  .then((formattedTodos) => console.log(formattedTodos));
