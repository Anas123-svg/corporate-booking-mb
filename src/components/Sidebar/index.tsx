"use client";
import React from "react";
import Link from "next/link";
import SidebarItem from "@/components/Sidebar/SidebarItem";
import ClickOutside from "@/components/ClickOutside";
import useLocalStorage from "@/hooks/useLocalStorage";
import { LuLayoutDashboard } from "react-icons/lu";
import { FaHouseChimney } from "react-icons/fa6";
import { FaBuilding } from "react-icons/fa";
import { RiAdminFill } from "react-icons/ri";
import { IoSettingsSharp } from "react-icons/io5";
import { MdImportantDevices } from "react-icons/md";
import { FaPowerOff } from "react-icons/fa";
import Logout from "../Logout";
import { useTranslation } from "react-i18next";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg0: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const [pageName, setPageName] = useLocalStorage("selectedMenu", "dashboard");
  const { t } = useTranslation();

  const menuGroups = [
    {
      name: t("menu"),
      menuItems: [
        {
          icon: <LuLayoutDashboard className="fill-current" size={20} />,
          label: t("dashboard"),
          route: "/",
        },
        {
          icon: <FaHouseChimney className="fill-current" size={20} />,
          label: t("properties"),
          route: "/properties",
        },

        {
          icon: <FaBuilding className="fill-current" size={20} />,
          label: t("projects"),
          route: "/projects",
        },
        // {
        //   icon: <RiAdminFill className="fill-current" size={20} />,
        //   label: "Blogs",
        //   route: "/blogs",
        // },
        {
          icon: <RiAdminFill className="fill-current" size={20} />,
          label: t("admins"),
          route: "/admins",
        },
        {
          icon: <MdImportantDevices className="fill-current" size={20} />,
          label: t("heroProperties"),
          route: "/hero-properties",
        },
        {
          icon: <IoSettingsSharp className="fill-current" size={20} />,
          label: t("settings"),
          route: "/settings",
        },
      ],
    },
  ];

  return (
    <ClickOutside onClick={() => setSidebarOpen(false)}>
      <aside
        className={`fixed left-0 top-0 z-999 flex h-screen w-72.5 flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
          <Link href="/">
            <h1 className="text-3xl font-extrabold tracking-wide text-white">
              {t("adminPanel")}
            </h1>
          </Link>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-controls="sidebar"
            className="block lg:hidden"
          >
            <svg
              className="fill-current"
              width="20"
              height="18"
              viewBox="0 0 20 18"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
                fill=""
              />
            </svg>
          </button>
        </div>
        <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
          <nav className="mt-5 px-4 py-4 lg:mt-9 lg:px-6">
            {menuGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">
                  {group.name}
                </h3>

                <ul className="mb-6 flex flex-col gap-1.5">
                  {group.menuItems
                    .filter((menuItem) => menuItem && menuItem.route)
                    .map((menuItem, menuIndex) => (
                      <SidebarItem
                        key={menuIndex}
                        item={menuItem}
                        pageName={pageName}
                        setPageName={setPageName}
                      />
                    ))}
                </ul>
              </div>
            ))}
            <Logout className="group relative flex w-full items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark  dark:hover:bg-meta-4">
              <FaPowerOff className="fill-current" size={20} />
              {t("logout")}
            </Logout>
          </nav>
        </div>
      </aside>
    </ClickOutside>
  );
};

export default Sidebar;
