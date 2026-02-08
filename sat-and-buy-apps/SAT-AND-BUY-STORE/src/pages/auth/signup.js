import { FiLock, FiMail, FiUser } from "react-icons/fi";

//internal import
import Layout from "@layout/Layout";
import Error from "@components/form/Error";
import InputArea from "@components/form/InputArea";
import BottomNavigation from "@components/login/BottomNavigation";
import useSignupSubmit from "@hooks/useSignupSubmit";

const SignUp = () => {
  const { handleSubmit, submitHandler, register, errors, loading } =
    useSignupSubmit();

  return (
    <Layout title="Signup" description="this is sign up page">
      <div className="mx-auto max-w-screen-2xl px-3 sm:px-10">
        <div className="py-4 flex flex-col lg:flex-row w-full">
          <div className="w-full sm:p-5 lg:p-8">
            <div className="mx-auto text-left justify-center rounded-md w-full max-w-lg px-4 py-8 sm:p-10 overflow-hidden align-middle transition-all transform bg-white shadow-xl rounded-2x">
              <div className="overflow-hidden mx-auto">
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold font-serif">Signing Up</h2>
                  <p className="text-sm md:text-base text-gray-500 mt-2 mb-8 sm:mb-10">
                    Create an account by sign up with provider.
                  </p>
                </div>
                <form
                  onSubmit={handleSubmit(submitHandler)}
                  className="flex flex-col justify-center mb-6"
                >
                  <div className="grid grid-cols-1 gap-5">
                    <div className="form-group">
                      <InputArea
                        register={register}
                        label="Nom complet"
                        name="name"
                        type="text"
                        placeholder="Ex. Lionel Messi"
                        Icon={FiUser}
                        rules={{
                          required: "Le nom est requis.",
                        }}
                      />

                      <Error errorName={errors.name} />
                    </div>

                    <div className="form-group">
                      <InputArea
                        register={register}
                        label="Email"
                        name="email"
                        type="email"
                        placeholder="email@exemple.com"
                        Icon={FiMail}
                        rules={{
                          required: "L'email est requis.",
                        }}
                      />
                      <Error errorName={errors.email} />
                    </div>

                    <div className="form-group">
                      <InputArea
                        register={register}
                        label="Mot de passe"
                        name="password"
                        type="password"
                        placeholder="••••••"
                        Icon={FiLock}
                        rules={{
                          required: "Le mot de passe est requis.",
                          minLength: {
                            value: 6,
                            message: "6 caractères minimum.",
                          },
                        }}
                      />

                      <Error errorName={errors.password} />
                    </div>

                    <div className="form-group">
                      <InputArea
                        register={register}
                        label="Confirmez le mot de passe"
                        name="confirmPassword"
                        type="password"
                        placeholder="••••••"
                        Icon={FiLock}
                        rules={{
                          required: "Confirmez votre mot de passe.",
                        }}
                      />

                      <Error errorName={errors.confirmPassword} />
                    </div>

                    {loading ? (
                      <button
                        disabled
                        type="button"
                        className="md:text-sm leading-5 inline-flex items-center cursor-pointer transition ease-in-out duration-300 font-medium text-center justify-center border-0 border-transparent rounded-md placeholder-white focus-visible:outline-none focus:outline-none bg-emerald-500 text-white px-5 md:px-6 lg:px-8 py-2 md:py-3 lg:py-3 h-12 mt-1 text-sm lg:text-sm w-full sm:w-auto"
                      >
                        <img
                          src="/loader/spinner.gif"
                          alt="Loading"
                          width={20}
                          height={10}
                        />
                        <span className="font-serif ml-2 font-light">
                          Traitement…
                        </span>
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="w-full text-center py-3 rounded bg-emerald-500 text-white hover:bg-emerald-600 transition-all focus:outline-none my-1"
                      >
                        Créer mon compte
                      </button>
                    )}
                  </div>
                </form>
                <BottomNavigation
                  desc
                  route={"/auth/login"}
                  pageName={"Login"}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SignUp;
