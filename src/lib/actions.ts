import { executeAction } from "./executeAction";
import { prisma } from "./prisma";
import { ValidateScheme } from "./scheme";

export const signUp = async (formData: FormData) => {
  return executeAction({
    actionFn: async () => {
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const validate = ValidateScheme.parse({ email, password });

      await prisma.user.create({
        data: {
          email: validate.email.toLowerCase(),
          password: validate.password,
        },
      });
    },
  });
};
