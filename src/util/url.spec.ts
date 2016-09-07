import test from "ava";
import { joinUrl } from "./url";

test("joinUrl joins parts by forward slash", t => {
    t.is(joinUrl("foo", "bar", "baz"), "/foo/bar/baz");
});

test("joinUrl strips excess slashes from extremes of parts", t => {
    t.is(joinUrl("///foo////", "bar//", "//baz///"), "/foo/bar/baz");
});

test("joinUrl doesn't remove slashes from inside parts", t => {
    t.is(joinUrl("foo/bar", "baz"), "/foo/bar/baz");
    t.is(joinUrl("foo///bar", "baz"), "/foo///bar/baz");
});
