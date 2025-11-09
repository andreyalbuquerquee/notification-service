export abstract class ValueObject<T> {
  protected readonly props: T;

  protected constructor(props: T) {
    this.props = props;
    this.validate(props);
  }

  protected validate(_props: T): void {}

  equals(other?: ValueObject<T> | null): boolean {
    if (!other) {
      return false;
    }

    if (other === this) {
      return true;
    }

    if (other.constructor !== this.constructor) {
      return false;
    }

    return deepEqual(this.value, other.value);
  }

  get value(): T {
    return this.props;
  }

  toString(): string {
    return typeof this.value === 'object' && this.value !== null
      ? JSON.stringify(this.value)
      : String(this.value);
  }

  toJSON(): unknown {
    return this.value;
  }
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) {
    return true;
  }

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  if (typeof a !== typeof b) {
    return false;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }
    return a.every((item, index) => deepEqual(item, b[index]));
  }

  if (isPlainObject(a) && isPlainObject(b)) {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    const bKeySet = new Set(bKeys);
    return aKeys.every((key) => {
      if (!bKeySet.has(key)) return false;
      return deepEqual(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key],
      );
    });
  }

  return Object.is(a, b);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value.constructor === Object || Object.getPrototypeOf(value) === null)
  );
}
