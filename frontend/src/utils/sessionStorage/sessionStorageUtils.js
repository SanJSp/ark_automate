/**
 * @description Checks if passed item already exists in session storage and initializes with given value if not existing.
 * @param {String} itemToCheckFor The selected item to check for in the session storage.
 * @param {String} valueToInitTo The value to init to if the item is not existing in session storage yet.
 */
const initSessionStorage = (itemToCheckFor, valueToInitTo) => {
  if (sessionStorage.getItem(itemToCheckFor) === null)
    sessionStorage.setItem(itemToCheckFor, valueToInitTo);
};

const initAvailableApplicationsSessionStorage = () => {
  initSessionStorage('availableApplications', JSON.stringify([]));
  const taskAndApplicationCombinations = JSON.parse(
    sessionStorage.getItem('taskApplicationCombinations')
  );
  const allApplications = taskAndApplicationCombinations.map(
    (singleCombination) => singleCombination.application
  );
  const applicationsWithoutDuplicates = allApplications.filter(
    (singleApplication, index, self) =>
      self.indexOf(singleApplication) === index
  );

  sessionStorage.setItem(
    'availableApplications',
    JSON.stringify(applicationsWithoutDuplicates)
  );
};

export { initAvailableApplicationsSessionStorage, initSessionStorage };
