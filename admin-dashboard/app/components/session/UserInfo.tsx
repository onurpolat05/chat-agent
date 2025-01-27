import { UserMetadata } from '../../types/session';

interface UserInfoProps {
  userMetadata: UserMetadata;
}

export const UserInfo = ({ userMetadata }: UserInfoProps) => {
  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-md font-semibold mb-2">User Information</h3>
      <div className="grid gap-2 text-sm">
        <p><span className="font-medium">IP Address:</span> {userMetadata?.ipAddress || 'Unknown'}</p>
        <p><span className="font-medium">Device:</span> {userMetadata?.device?.type || 'Unknown'}</p>
        <p><span className="font-medium">Browser:</span> {userMetadata?.device?.browser || 'Unknown'}</p>
        <p><span className="font-medium">OS:</span> {userMetadata?.device?.os || 'Unknown'}</p>
      </div>
    </div>
  );
}; 