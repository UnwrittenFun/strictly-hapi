import {Views} from "../../";
import {BasicView} from "./basic";

export class AllViews {
  @Views("/basic")
  get basic() {
    return new BasicView();
  }
}