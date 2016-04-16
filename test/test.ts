import {server} from "./server";

import * as chaiAsPromised from "chai-as-promised";
import * as chai from "chai";

chai.use(chaiAsPromised);
chai.should();

describe("Routes", function () {
  it("registers route with no args", function () {
    return server.inject({method: "get", url: "/basic"})
      .should.eventually.have.property("statusCode").that.equals(200);
  });

  it("responds with the value returned", function () {
    return server.inject({method: "get", url: "/basic"})
      .should.eventually.have.property("result").that.equals("Success!");
  });

  it("registers route with a path", function () {
    return server.inject({method: "get", url: "/basic/with/path"})
      .should.eventually.have.property("statusCode").that.equals(200);
  });
  
  it ("injects routeInfo", function () {
    return server.inject({method: "get", url: "/basic/routeInfo?first=James&last=Birtles"})
      .should.eventually.have.property("result")
        .that.deep.equal({
          first: "James",
          last: "Birtles"
        });
  });
});

describe("Validation", function () {
  it ("validates query params", function () {
    return server.inject({method: "get", url: "/basic/validate"})
      .should.eventually.have.property("statusCode").that.equals(400);
  });

  it ("allows valid query params", function () {
    return server.inject({method: "get", url: "/basic/validate?name=James"})
      .should.eventually.have.property("statusCode").that.equals(200);
  });
});

describe("Controllers", function () {
  it("returns data back to the route", function () {
    return server.inject({method: "get", url: "/basic/controller"})
      .should.eventually.have.property("result").that.equals("Hello from BasicController");
  });

  it("returns data back to the route via a promise", function () {
    return server.inject({method: "get", url: "/basic/controller/wait"})
      .should.eventually.have.property("result").that.equals("Hello from BasicController");
  });
})