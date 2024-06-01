import { expect, test, describe } from "bun:test";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { faker } from "@faker-js/faker";
import type { AppRouter } from "../router";

const client = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:8000",
      headers: {
        authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
      },
    }),
  ],
});

describe("first", () => {
  test("Testing Creating a Post", async () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    // Update the currentDate by adding one year
    currentDate.setFullYear(currentYear + 1);

    const newDate = currentDate;

    const user = await client.auth.signup.mutate({
      name: faker.person.firstName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    });

    const input = {
      content: faker.lorem.paragraph(),
      isCountDown: false,
      countDownDate: newDate.toDateString(),
      qoute: faker.lorem.sentence(),
    };
    const validInput = {
      ...input,
      userId: user.id,
    };

    const post = await client.post.createpost.mutate(input);
    console.log(post);
    // expect(post).toBeDefined();
    // expect(post).toMatchObject(validInput);
  });
});
