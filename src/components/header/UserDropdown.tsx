import { useState } from "react";
import { useNavigate } from "react-router";
import { roleLabels } from "@/components/siv/StatusBadges";
import { useAuth } from "@/context/AuthContext";
import { UserCircleIcon } from "@/icons";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";

export default function UserDropdown() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen((prev) => !prev);
  const closeDropdown = () => setIsOpen(false);

  const handleLogout = async () => {
    closeDropdown();
    await logout();
    navigate("/signin", { replace: true });
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="dropdown-toggle flex items-center gap-2 rounded-lg p-1.5 text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        aria-label="Perfil y cuenta de usuario"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00D68F]/15 text-[#00A874] dark:text-[#00D68F]">
          <UserCircleIcon className="size-6" />
        </span>

        <span className="hidden text-start text-xs font-medium sm:block">
          <span className="block font-semibold text-gray-800 dark:text-white/90">
            {user?.fullName ?? "Operador"}
          </span>
          <span className="block text-[11px] text-gray-400 dark:text-gray-500">
            {user ? roleLabels[user.role] : "En servicio"}
          </span>
        </span>

        <svg
          className={`stroke-gray-500 transition-transform duration-200 dark:stroke-gray-400 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="16"
          height="16"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute inset-e-0 mt-3 flex w-60 flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-[#1E293B] dark:bg-[#111826]"
      >
        <div className="border-b border-gray-100 px-2 pb-3 dark:border-[#1E293B]">
          <span className="block text-sm font-semibold text-gray-800 dark:text-white/90">
            {user?.fullName ?? "Usuario SIV IA"}
          </span>
          <span className="mt-0.5 block truncate text-xs text-gray-400 dark:text-slate-400">
            {user?.email ?? ""}
          </span>
        </div>

        <ul className="flex flex-col gap-1 border-b border-gray-100 py-2 dark:border-[#1E293B]">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              to="/profile"
              className="group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
            >
              <UserCircleIcon className="size-4 text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200" />
              <span>Mi Perfil</span>
            </DropdownItem>
          </li>
        </ul>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="flex w-full items-center justify-center rounded-lg px-2.5 py-2 text-xs font-semibold text-[#F0453F] transition hover:bg-[#F0453F]/10"
          >
            Cerrar sesión
          </button>
        </div>
      </Dropdown>
    </div>
  );
}
