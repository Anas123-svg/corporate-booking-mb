import DarkModeSwitcher from "./DarkModeSwitcher";
import { FaPowerOff } from "react-icons/fa";
import useAuthStore from "@/store/authStore";
import Logout from "../Logout";
import logo from "@/assets/logo.png";
import logoWhite from "@/assets/logoWhite.png";
import { useTranslation } from "react-i18next";

const Header = (props: {
  sidebarOpen: string | boolean | undefined;
  setSidebarOpen: (arg0: boolean) => void;
}) => {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  return (
    <header className="sticky top-0 z-999 flex w-full bg-white drop-shadow-1 dark:bg-boxdark dark:drop-shadow-none">
      <div className="flex flex-grow items-center justify-between px-4 py-4 shadow-2 md:px-6 2xl:px-11">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
            <button
              aria-controls="sidebar"
              onClick={(e) => {
                e.stopPropagation();
                props.setSidebarOpen(!props.sidebarOpen);
              }}
              className="z-99999 block rounded-sm border border-stroke bg-white p-1.5 shadow-sm dark:border-strokedark dark:bg-boxdark lg:hidden"
            >
              <span className="relative block h-5.5 w-5.5 cursor-pointer">
                <span className="du-block absolute right-0 h-full w-full">
                  <span
                    className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-[0] duration-200 ease-in-out dark:bg-white ${
                      !props.sidebarOpen && "!w-full delay-300"
                    }`}
                  ></span>
                  <span
                    className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-150 duration-200 ease-in-out dark:bg-white ${
                      !props.sidebarOpen && "delay-400 !w-full"
                    }`}
                  ></span>
                  <span
                    className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-200 duration-200 ease-in-out dark:bg-white ${
                      !props.sidebarOpen && "!w-full delay-500"
                    }`}
                  ></span>
                </span>
                <span className="absolute right-0 h-full w-full rotate-45">
                  <span
                    className={`absolute left-2.5 top-0 block h-full w-0.5 rounded-sm bg-black delay-300 duration-200 ease-in-out dark:bg-white ${
                      !props.sidebarOpen && "!h-0 !delay-[0]"
                    }`}
                  ></span>
                  <span
                    className={`delay-400 absolute left-0 top-2.5 block h-0.5 w-full rounded-sm bg-black duration-200 ease-in-out dark:bg-white ${
                      !props.sidebarOpen && "!h-0 !delay-200"
                    }`}
                  ></span>
                </span>
              </span>
            </button>
          </div>
          <img src={logo.src} alt="logo" className="w-28 dark:hidden" />
          <img
            src={logoWhite.src}
            alt="logo"
            className="hidden w-28 dark:block"
          />
        </div>
        <div className="flex items-center gap-3">
          <ul className="flex items-center gap-2 2xsm:gap-4">
            <DarkModeSwitcher />
          </ul>
          <div className="flex items-center gap-4">
            <span className="hidden text-right lg:block">
              <span className="block text-sm font-medium text-black dark:text-white">
                {user?.firstname} {user?.lastname}
              </span>
              <span className="block text-xs">{t("administrator")}</span>
            </span>
            <span className="h-12 w-12">
              <img
                src="https://res.cloudinary.com/dchubllrz/image/upload/v1769136939/hnohiasxwxjo4ja8d5mi.png"
                alt="User"
                className="h-full w-full rounded-full object-cover"
              />
            </span>
          </div>
          <Logout className="flex items-center gap-2 rounded-lg bg-danger p-3 text-sm font-medium text-white">
            <FaPowerOff className="text-white" size={20} />
          </Logout>
        </div>
      </div>
    </header>
  );
};

export default Header;
