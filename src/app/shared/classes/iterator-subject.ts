import { BehaviorSubject } from "rxjs";

export {
  IteratorSubject
}

class IteratorSubject<T> extends BehaviorSubject<T> {

  private _iterator: IterableIterator<T>;

  constructor(_array: T[]) {
    function* iterateValue() {
      for (let value of _array) {
        yield value;
      }
    }

    const _iterator = iterateValue();
    const { done, value } =  _iterator.next();

    super(value);

    this._iterator = _iterator;
    if (done) {
      this.complete();
    }
  }

  private pushNextValue({done, value}: {done: boolean, value: T}) {
    if (done && value === undefined) {
      this.complete();
    } else {
      this.next(value);
    }
  }

  public push(value?: T) {
    this.pushNextValue(this._iterator.next(value));
  }
}
