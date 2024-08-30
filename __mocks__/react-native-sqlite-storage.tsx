const SQLite = {
  openDatabase: jest.fn(() => ({
    transaction: jest.fn((callback) => {
      callback({
        executeSql: jest.fn((sql, params, successCallback) => {
          successCallback(null, {
            rows: {
              length: 0,
              item: () => null,
            },
          });
        }),
      });
    }),
  })),
};

export default SQLite;
