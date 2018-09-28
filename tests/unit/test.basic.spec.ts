import Vue from "vue";
import store from "../store";

const item = {
  foo: "bar"
};

const state: any = store.state;

describe("Simple testing for undo/redo on a namespaced vuex store", () => {
  it("Add item to list", () => {
    const expectedState = [{ ...item }];

    // Commit the item to the store and assert
    store.commit("list/addItem", { item });

    expect(state.list.list).toEqual(expectedState);
  });

  it("Check 'canUndo' value; The undo function should remove the item", async () => {
    expect(state.list.canUndo).toBeTruthy();

    await store.dispatch("list/undo");
  });

  it("Check 'canUndo' value, Assert list items after undo", () => {
    expect(state.list.canUndo).toBeFalsy();
    expect(state.list.list).toEqual([]);
  });

  it("Redo 'addItem' commit", async () => {
    expect(state.list.canRedo).toBeTruthy();
    await store.dispatch("list/redo");
  });

  it("Grouped mutations: adding two items to the list", async () => {
    const anotherItem = { foo: "baz" };
    const expectedState = [{ ...item }, { ...item }, { ...anotherItem }];
    const actionGroup = "myAction";

    // Commit the items to the store and assert
    store.commit("list/addItem", { item, actionGroup });
    store.commit("list/addItem", { item: anotherItem, actionGroup });
    expect(state.list.list).toEqual(expectedState);
  });

  it("Dispatch undo", async () => {
    // The undo function should remove the item
    await store.dispatch("list/undo");
  });

  it("Assert list items after undo: should contain 1 item", async () => {
    expect(state.list.list).toEqual([{ ...item }]);
  });

  it("Redo 'addItem' twice (grouped mutations)", async () => {
    // Redo 'addItem'
    await store.dispatch("list/redo");
  });

  it("Assert list items after redo: should contain 3 items", async () => {
    const anotherItem = { foo: "baz" };
    const expectedState = [{ ...item }, { ...item }, { ...anotherItem }];

    expect(state.list.list).toEqual(expectedState);
  });

  it('"addShadow" action should be dispatched on undo', async () => {
    const expectedState = [...state.list.list, item];

    store.commit("list/addItem", {
      index: 0,
      item,
      undoCallback: "addShadow",
      redoCallback: "removeShadow"
    });
    expect(state.list.list).toEqual(expectedState);

    await store.dispatch("list/undo");
  });

  it("Check shadow: should contain 1 item", () => {
    const expectedState = [{ ...item }];
    expect(state.list.shadow).toEqual(expectedState);
  });

  it('"removeShadow" should be dispatched on redo', async () => {
    // Redo 'addItem'
    await store.dispatch("list/redo");
  });

  it("Check shadow: should contain no items", () => {
    const expectedState = [
      { foo: "bar" },
      { foo: "bar" },
      { foo: "baz" },
      { foo: "bar" }
    ];

    expect(state.list.list).toEqual(expectedState);
    expect(state.list.shadow).toEqual([]);
  });
});