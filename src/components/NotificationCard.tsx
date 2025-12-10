
import React from "react";
import { Notification } from "@/hooks/useNotifications";

interface NotificationCardProps {
  notification: Notification;
  onClick: (notification: Notification) => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ notification, onClick }) => (
  <div
    className={`p-3 border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer ${!notification.isRead ? 'bg-gray-800/30' : ''}`}
    onClick={() => onClick(notification)}
  >
    <div className="flex gap-3">
      {notification.image && (
        <img
          src={notification.image}
          alt={notification.title}
          className="w-12 h-16 object-cover rounded"
        />
      )}
      <div>
        <h4 className="font-medium text-sm">{notification.title}</h4>
        <p className="text-gray-400 text-xs mt-1">{notification.message}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-gray-500 text-xs">
            {new Date(notification.date).toLocaleDateString()}
          </span>
          {!notification.isRead && (
            <span className="bg-cinemax-500 w-2 h-2 rounded-full"></span>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default NotificationCard;
