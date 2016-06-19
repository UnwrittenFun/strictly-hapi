export function Controller(name: any) {
  return function (target: any) {
    target.controllerId = name;
    return target;
  }
}
