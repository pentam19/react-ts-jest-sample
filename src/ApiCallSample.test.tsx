import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import { setupServer } from "msw/node";
//import { beforeAll, afterEach, afterAll } from "jest-circus"; // これがあるとmockが使用されない
import ApiCallSample from "./ApiCallSample";

const server = setupServer(
  rest.get("https://jsonplaceholder.typicode.com/users/1", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ username: "Dummy" }));
  })
);

// 最初に１回だけ実行される
beforeAll(() => {
  server.listen();
});
// テストケースが１つ終わるたびに実行される
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
// 最後に実行される
afterAll(() => server.close());

describe("Mock API Test", () => {
  it("Success", async () => {
    render(<ApiCallSample />);
    userEvent.click(screen.getByRole("button"));
    expect(await screen.findByText("Dummy")).toBeInTheDocument();
    expect(screen.getByRole("button")).toHaveAttribute("disabled");
  });
  it("Failed", async () => {
    // このテストケースだけ、mockサーバーの挙動を書き換える
    server.use(
      rest.get(
        "https://jsonplaceholder.typicode.com/users/1",
        (req, res, ctx) => {
          return res(ctx.status(400));
        }
      )
    );
    render(<ApiCallSample />);
    userEvent.click(screen.getByRole("button"));
    expect(await screen.findByTestId("error")).toHaveTextContent(
      "Fetching Failed"
    );
    expect(screen.queryByRole("heading")).toBeNull();
    expect(screen.getByRole("button")).not.toHaveAttribute("disabled");
  });
});
/*
$ npm test
結果の出力例
 PASS  src/ApiCallSample.test.tsx (5.857 s)
  Mock API Test
    ✓ Success (162 ms)
    ✓ Failed (49 ms)
*/
