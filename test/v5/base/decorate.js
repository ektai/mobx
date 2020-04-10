// @ts-check

import {
    observable,
    computed,
    autorun,
    action,
    isObservableObject,
    isObservable,
    isObservableProp,
    isComputedProp,
    isAction,
    makeObservable
} from "../../../src/v5/mobx"

// @ts-ignore
import { primitive, serialize, deserialize, createModelSchema } from "serializr"

test("throws on undeclared prop", () => {
    class Box {
        constructor() {
            makeObservable(this, {
                // @ts-ignore
                notExisting: true
            })
        }
    }

    expect(() => {
        new Box()
    }).toThrowErrorMatchingInlineSnapshot(`"[mobx] Property is not defined: 'notExisting'"`)
})

test("decorate should work", function() {
    class Box {
        // @ts-ignore
        uninitialized
        height = 20
        sizes = [2]
        someFunc = function() {
            return 2
        }
        get width() {
            return (
                this.undeclared *
                this.height *
                this.sizes.length *
                this.someFunc() *
                (this.uninitialized ? 2 : 1)
            )
        }
        addSize() {
            // @ts-ignore
            this.sizes.push([3])
            // @ts-ignore
            this.sizes.push([4])
        }
        constructor() {
            makeObservable(this, {
                uninitialized: observable.ref,
                height: observable,
                sizes: observable,
                someFunc: observable,
                width: computed,
                addSize: action
            })

            this.undeclared = 1
        }
    }

    const box = new Box()
    expect(isObservableObject(box)).toBe(true)
    expect(box.uninitialized).toBe(undefined)
    expect(box.height).toBe(20)
    expect(isObservableProp(box, "uninitialized")).toBe(true)
    expect(isObservableProp(box, "height")).toBe(true)
    expect(isObservableProp(box, "sizes")).toBe(true)
    expect(isObservable(box.sizes)).toBe(true)
    expect(isObservableProp(box, "someFunc")).toBe(true)
    expect(isComputedProp(box, "width")).toBe(true)
    expect(isAction(box.addSize)).toBe(true)

    const ar = []

    autorun(() => {
        ar.push(box.width)
    })

    expect(ar.slice()).toEqual([40])
    box.height = 10
    expect(ar.slice()).toEqual([40, 20])
    box.sizes.push(3, 4)
    expect(ar.slice()).toEqual([40, 20, 60])
    box.someFunc = () => 7
    expect(ar.slice()).toEqual([40, 20, 60, 210])
    box.uninitialized = true
    expect(ar.slice()).toEqual([40, 20, 60, 210, 420])
    box.addSize()
    expect(ar.slice()).toEqual([40, 20, 60, 210, 420, 700])
    box.undeclared = 2 // not observable, doesn't trigger anything
    expect(ar.slice()).toEqual([40, 20, 60, 210, 420, 700])

    const box2 = new Box()
    expect(box2.width).toBe(40) // no shared state!
})

test("decorate should work with plain object", function() {
    const box = {
        /** @type {boolean | undefined} */
        uninitialized: undefined,
        height: 20,
        sizes: [2],
        someFunc: function() {
            return 2
        },
        get width() {
            return (
                this.undeclared *
                this.height *
                this.sizes.length *
                this.someFunc() *
                (this.uninitialized ? 2 : 1)
            )
        },
        addSize() {
            // @ts-ignore
            this.sizes.push([3])
            // @ts-ignore
            this.sizes.push([4])
        }
    }

    makeObservable(box, {
        uninitialized: observable,
        height: observable,
        sizes: observable,
        someFunc: observable,
        width: computed,
        addSize: action
    })
    box.undeclared = 1

    expect(isObservableObject(box)).toBe(true)
    expect(box.uninitialized).toBe(undefined)
    expect(box.height).toBe(20)
    expect(isObservableProp(box, "uninitialized")).toBe(true)
    expect(isObservableProp(box, "height")).toBe(true)
    expect(isObservableProp(box, "sizes")).toBe(true)
    expect(isObservable(box.sizes)).toBe(true)
    expect(isObservableProp(box, "someFunc")).toBe(true)
    expect(isComputedProp(box, "width")).toBe(true)
    expect(isAction(box.addSize)).toBe(true)

    const ar = []

    autorun(() => {
        ar.push(box.width)
    })

    expect(ar.slice()).toEqual([40])
    box.height = 10
    expect(ar.slice()).toEqual([40, 20])
    box.sizes.push(3, 4)
    expect(ar.slice()).toEqual([40, 20, 60])
    box.someFunc = () => 7
    expect(ar.slice()).toEqual([40, 20, 60, 210])
    box.uninitialized = true
    expect(ar.slice()).toEqual([40, 20, 60, 210, 420])
    box.addSize()
    expect(ar.slice()).toEqual([40, 20, 60, 210, 420, 700])
    box.undeclared = 2 // not observable, doesn't trigger anything
    expect(ar.slice()).toEqual([40, 20, 60, 210, 420, 700])
})

test("decorate should work with Object.create", function() {
    const Box = {
        uninitialized: undefined,
        height: 20,
        sizes: [2],
        someFunc: function() {
            return 2
        },
        get width() {
            return (
                this.undeclared *
                this.height *
                this.sizes.length *
                this.someFunc() *
                (this.uninitialized ? 2 : 1)
            )
        },
        addSize() {
            // @ts-ignore
            this.sizes.push([3])
            // @ts-ignore
            this.sizes.push([4])
        }
    }

    const box = Object.create(Box)
    makeObservable(box, {
        uninitialized: observable,
        height: observable,
        sizes: observable,
        someFunc: observable,
        width: computed,
        addSize: action
    })
    box.undeclared = 1

    expect(isObservableObject(box)).toBe(true)
    expect(box.uninitialized).toBe(undefined)
    expect(box.height).toBe(20)
    expect(isObservableProp(box, "uninitialized")).toBe(true)
    expect(isObservableProp(box, "height")).toBe(true)
    expect(isObservableProp(box, "sizes")).toBe(true)
    expect(isObservable(box.sizes)).toBe(true)
    expect(isObservableProp(box, "someFunc")).toBe(true)
    expect(isComputedProp(box, "width")).toBe(true)
    expect(isAction(box.addSize)).toBe(true)

    const ar = []

    autorun(() => {
        ar.push(box.width)
    })

    expect(ar.slice()).toEqual([40])
    box.height = 10
    expect(ar.slice()).toEqual([40, 20])
    box.sizes.push(3, 4)
    expect(ar.slice()).toEqual([40, 20, 60])
    box.someFunc = () => 7
    expect(ar.slice()).toEqual([40, 20, 60, 210])
    box.uninitialized = true
    expect(ar.slice()).toEqual([40, 20, 60, 210, 420])
    box.addSize()
    expect(ar.slice()).toEqual([40, 20, 60, 210, 420, 700])
    box.undeclared = 2 // not observable, doesn't trigger anything
    expect(ar.slice()).toEqual([40, 20, 60, 210, 420, 700])
})

test("decorate should work with constructor function", function() {
    function Box() {
        this.uninitialized = undefined
        this.height = 20
        Object.defineProperty(this, "width", {
            configurable: true,
            enumerable: false,
            get() {
                /** @type {Box} */
                const t /** @type {any} */ = this

                return (
                    // @ts-ignore
                    t.undeclared *
                    t.height *
                    t.sizes.length *
                    t.someFunc() *
                    (t.uninitialized ? 2 : 1)
                )
            }
        })
        this.sizes = [2]
        this.someFunc = function() {
            return 2
        }
        this.addSize = function() {
            this.sizes.push([3])
            this.sizes.push([4])
        }
        makeObservable(this, {
            uninitialized: observable,
            height: observable,
            sizes: observable,
            someFunc: observable,
            width: computed,
            addSize: action
        })
    }

    const box = new Box()
    // @ts-ignore
    box.undeclared = 1

    expect(isObservableObject(box)).toBe(true)
    expect(box.uninitialized).toBe(undefined)
    expect(box.height).toBe(20)
    expect(isObservableProp(box, "uninitialized")).toBe(true)
    expect(isObservableProp(box, "height")).toBe(true)
    expect(isObservableProp(box, "sizes")).toBe(true)
    expect(isObservable(box.sizes)).toBe(true)
    expect(isObservableProp(box, "someFunc")).toBe(true)
    expect(isComputedProp(box, "width")).toBe(true)
    expect(isAction(box.addSize)).toBe(true)

    const ar = []

    autorun(() => {
        // @ts-ignore
        ar.push(box.width)
    })

    expect(ar.slice()).toEqual([40])
    box.height = 10
    expect(ar.slice()).toEqual([40, 20])
    box.sizes.push(3, 4)
    expect(ar.slice()).toEqual([40, 20, 60])
    box.someFunc = () => 7
    expect(ar.slice()).toEqual([40, 20, 60, 210])
    box.uninitialized = true
    expect(ar.slice()).toEqual([40, 20, 60, 210, 420])
    box.addSize()
    expect(ar.slice()).toEqual([40, 20, 60, 210, 420, 700])

    const box2 = new Box()
    // @ts-ignore
    box2.undeclared = 1
    // @ts-ignore
    expect(box2.width).toBe(40) // no shared state!
})

// TODO: find decent behavior here, for example die because the `this` on the observable setter is not the owning instance?
test.skip("decorate should work with inheritance through Object.create", () => {
    const P = {
        x: 3
    }
    makeObservable(P, {
        x: observable
    })

    const child1 = Object.create(P)
    expect(child1.x).toBe(3) // now an own property
    child1.x = 4
    expect(child1.x).toBe(4)
    const child2 = Object.create(P)
    expect(child2.x).toBe(3)
    child2.x = 5
    expect(child2.x).toBe(5)
    expect(child1.x).toBe(4)
})

test("decorate should not allow @observable on getter", function() {
    const obj = {
        x: 0,
        get y() {
            return 0
        }
    }

    expect(() => {
        makeObservable(obj, {
            x: computed
        })
    }).toThrowErrorMatchingInlineSnapshot(
        `"[mobx] Cannot decorate 'x': computed can only be used on getter properties."`
    )

    expect(() => {
        makeObservable(obj, {
            x: action
        })
    }).toThrowErrorMatchingInlineSnapshot(
        `"[mobx] Cannot decorate 'x': action can only be used on properties with a function value."`
    )

    expect(() => {
        makeObservable(obj, {
            y: observable
        })
    }).toThrowErrorMatchingInlineSnapshot(
        `"[mobx] Cannot decorate 'y': observable cannot be used on setter / getter properties."`
    )
})

test("decorate a property with two decorators", function() {
    let updatedByAutorun

    class Obj {
        x = null

        constructor() {
            makeObservable(this, {
                x: observable
            })
        }
    }
    createModelSchema(Obj, {
        x: primitive()
    })

    const obj = deserialize(Obj, {
        x: 0
    })

    const d = autorun(() => {
        updatedByAutorun = obj.x
    })

    expect(isObservableProp(obj, "x")).toBe(true)
    expect(updatedByAutorun).toEqual(0)

    obj.x++

    expect(obj.x).toEqual(1)
    expect(updatedByAutorun).toEqual(1)
    expect(serialize(obj).x).toEqual(1)

    d()
})
