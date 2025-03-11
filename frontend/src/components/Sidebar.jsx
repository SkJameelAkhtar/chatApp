import { useEffect, useState, useMemo } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { authUser, onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  // Filter out current user and sort users with online users at the top
  const sortedUsers = useMemo(() => {
    return [...users]
      .filter(user => user._id !== authUser?._id) // Remove current user
      .sort((a, b) => {
        const isAOnline = onlineUsers.includes(a._id);
        const isBOnline = onlineUsers.includes(b._id);
        
        // Sort by online status first
        if (isAOnline && !isBOnline) return -1;
        if (!isAOnline && isBOnline) return 1;
        
        // Then sort alphabetically by name
        return a.fullName.localeCompare(b.fullName);
      });
  }, [users, onlineUsers, authUser]);

  // Apply "show online only" filter if needed
  const displayedUsers = useMemo(() => {
    return showOnlineOnly 
      ? sortedUsers.filter(user => onlineUsers.includes(user._id))
      : sortedUsers;
  }, [sortedUsers, onlineUsers, showOnlineOnly]);

  // Count online users (excluding self)
  const onlineUsersCount = useMemo(() => {
    return onlineUsers.filter(id => id !== authUser?._id).length;
  }, [onlineUsers, authUser]);

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">({onlineUsersCount} online)</span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {displayedUsers.length === 0 && (
          <div className="text-center py-4 text-zinc-500">
            {showOnlineOnly ? "No online contacts" : "No contacts found"}
          </div>
        )}
        
        {displayedUsers.map((user) => {
          const isOnline = onlineUsers.includes(user._id);
          return (
            <button
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`
                w-full flex items-center gap-3 hover:bg-base-300 py-3 px-5
                transition-colors duration-200
                ${selectedUser?._id === user._id ? "bg-base-300" : ""}
              `}
            >
              <div className="relative">
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt={user.fullName}
                  className="size-10 rounded-full object-cover"
                />
                {isOnline && (
                  <span className="absolute bottom-0 right-0 size-3 bg-emerald-500 rounded-full ring-2 ring-base-100" />
                )}
              </div>
              <div className="hidden lg:block text-left">
                <h3 className="font-medium">{user.fullName}</h3>
                <p className="text-sm text-zinc-500">
                  {isOnline ? "Online" : "Offline"}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;