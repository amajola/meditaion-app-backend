import { expect, test, describe } from "bun:test";
import { type AppRouter } from "../router";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { faker } from "@faker-js/faker";

const client = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:8000",
    }),
  ],
});

describe("first", () => {
  let identifier: number;
  const genName = faker.person.firstName();
  const genEmail = faker.internet.email();
  const genPassword = faker.internet.password();
  test("Testing Signup", async () => {
    const { name, id, email } = await client.auth.signup.mutate({
      name: genName,
      email: genEmail,
      password: genPassword,
    });
    identifier = id;
    expect(id).toBeString;
    expect({ name, email }).toMatchObject({ email: genEmail, name: genName });
  });

  test("Testing Sigin", async () => {
    const { id, name, email } = await client.auth.signin.mutate({
      email: genEmail,
      password: genPassword,
    });

    expect(id).toBe(identifier);
    expect({ name, email }).toMatchObject({ email: genEmail, name: genName });
  });
});
