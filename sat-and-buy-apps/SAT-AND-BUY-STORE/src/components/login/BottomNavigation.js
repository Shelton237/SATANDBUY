import Link from "next/link";

const BottomNavigation = ({ or, route, desc, pageName }) => {
  return (
    <>
      {or && (
        <div className="my-4 text-center font-medium">
          <div className="after:bg-gray-100 before:bg-gray-100">OR</div>
        </div>
      )}

      <div className="text-center text-sm text-gray-900 mt-4">
        <div className="text-gray-500 mt-2.5">
          {desc ? "Already have an account?" : "Don't have an account?"}
          <Link
            href={route}
            className="text-gray-800 hover:text-cyan-500 font-bold mx-2"
          >
            <span className="capitalize">{pageName}</span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default BottomNavigation;
