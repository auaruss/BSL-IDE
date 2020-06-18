type Is<T> = { tag: 'is', value: T};
type Not<T> = { tag: 'not', value: T};
type Intersection<T, U>
  = {
    tag: 'and',

  };