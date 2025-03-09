function createDependencyContainer() {
  const registrations = {};

  function register(id, dependencies, factory, singleton = true) {
    registrations[id] = {
      id,
      dependencies,
      factory,
      singleton,
      instance: undefined,
    };
  }

  function resolve(id) {
    const registration = registrations[id];

    if (!registration) {
      throw new Error('No registration with ID ' + id + ' found.');
    }

    const { singleton, instance } = registration;

    if (singleton && instance) {
      return instance;
    }

    const { dependencies, factory } = registration;
    const resolvedDependencies =
      dependencies.length === 0
        ? []
        : dependencies.map((dependency) => resolve(dependency));

    const newInstance = factory(resolvedDependencies);

    if (singleton) {
      registration.instance = newInstance;
    }

    return newInstance;
  }

  return {
    register,
    resolve,
  };
}
