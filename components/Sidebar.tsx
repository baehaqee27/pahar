"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import React from "react";
import { getAuth, signOut } from "firebase/auth";
import { app } from "../lib/firebase";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

interface MenuItem {
  name: string;
  path: string;
}

interface NavbarProps {
  menuItems: MenuItem[];
  title: string;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const Navbar: React.FC<NavbarProps> = ({ menuItems, title }) => {
  const router = useRouter();
  const pathname = usePathname();
  const auth = getAuth(app);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <Disclosure as="nav" className="bg-emerald-800 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <div className="shrink-0 font-bold text-lg">{title}</div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.path}
                    aria-current={pathname === item.path ? "page" : undefined}
                    className={classNames(
                      pathname === item.path
                        ? "bg-emerald-900 text-white"
                        : "text-emerald-300 hover:bg-emerald-700 hover:text-white",
                      "rounded-md px-3 py-2 text-sm font-medium"
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {/* Profile dropdown */}
              <Menu as="div" className="relative ml-3">
                <div>
                  <MenuButton className="relative flex max-w-xs items-center rounded-full bg-emerald-800 text-sm focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-emerald-800 focus:outline-none">
                    <span className="absolute -inset-1.5" />
                    <span className="sr-only">Open user menu</span>
                    <div className="size-8 rounded-full bg-emerald-600 flex items-center justify-center">
                      <span className="text-white font-bold">U</span>
                    </div>
                  </MenuButton>
                </div>
                <MenuItems
                  transition
                  className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 transition focus:outline-none data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                >
                  <MenuItem>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-none"
                    >
                      Sign out
                    </button>
                  </MenuItem>
                </MenuItems>
              </Menu>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            {/* Mobile menu button */}
            <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md bg-emerald-800 p-2 text-emerald-300 hover:bg-emerald-700 hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-emerald-800 focus:outline-none">
              <span className="absolute -inset-0.5" />
              <span className="sr-only">Open main menu</span>
              <Bars3Icon
                aria-hidden="true"
                className="block size-6 group-data-open:hidden"
              />
              <XMarkIcon
                aria-hidden="true"
                className="hidden size-6 group-data-open:block"
              />
            </DisclosureButton>
          </div>
        </div>
      </div>

      <DisclosurePanel className="md:hidden">
        <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
          {menuItems.map((item) => (
            <DisclosureButton
              key={item.name}
              as={Link}
              href={item.path}
              aria-current={pathname === item.path ? "page" : undefined}
              className={classNames(
                pathname === item.path
                  ? "bg-emerald-900 text-white"
                  : "text-emerald-300 hover:bg-emerald-700 hover:text-white",
                "block rounded-md px-3 py-2 text-base font-medium"
              )}
            >
              {item.name}
            </DisclosureButton>
          ))}
        </div>
        <div className="border-t border-emerald-700 pt-4 pb-3">
          <div className="mt-3 space-y-1 px-2">
            <DisclosureButton
              as="button"
              onClick={handleLogout}
              className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-emerald-300 hover:bg-emerald-700 hover:text-white"
            >
              Sign out
            </DisclosureButton>
          </div>
        </div>
      </DisclosurePanel>
    </Disclosure>
  );
};

export default Navbar;
