import React, {
  createContext,
  useState,
  useMemo,
  ReactNode,
  Dispatch,
  SetStateAction,
} from 'react';
export interface authContextType {
  userId: null | number;
  nickname: null | string;
  imageURL: null | string;
  isLoggedIn: boolean;
  latitude: null | number;
  longitude: null | number;
  townName: null | string;
  walletId: null | number;
  walletAddress: null | string;
  setUserId: Dispatch<SetStateAction<number | null>>;
  setNickname: Dispatch<SetStateAction<string | null>>;
  setImageURL: Dispatch<SetStateAction<string | null>>;
  setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
  setLatitude: Dispatch<SetStateAction<number | null>>;
  setLongitude: Dispatch<SetStateAction<number | null>>;
  setTownName: Dispatch<SetStateAction<string | null>>;
  setWalletId: Dispatch<SetStateAction<number | null>>;
  setWalletAddress: Dispatch<SetStateAction<string | null>>;
}

export const AuthContext = createContext<authContextType>({
  userId: null,
  nickname: null,
  imageURL: null,
  latitude: null,
  longitude: null,
  isLoggedIn: false,
  townName: null,
  walletId: null,
  walletAddress: null,
  setUserId: () => {},
  setNickname: () => {},
  setImageURL: () => {},
  setIsLoggedIn: () => {},
  setLatitude: () => {},
  setLongitude: () => {},
  setTownName: () => {},
  setWalletId: () => {},
  setWalletAddress: () => {},
});

export const AuthProvider = ({children}: {children: ReactNode}) => {
  const [userId, setUserId] = useState<number | null>(null);
  const [nickname, setNickname] = useState<string | null>(null);
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [townName, setTownName] = useState<string | null>(null);
  const [walletId, setWalletId] = useState<number | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const authValue = useMemo(() => {
    return {
      userId,
      nickname,
      imageURL,
      isLoggedIn,
      latitude,
      longitude,
      townName,
      walletId,
      walletAddress,
      setUserId,
      setNickname,
      setImageURL,
      setIsLoggedIn,
      setLatitude,
      setLongitude,
      setTownName,
      setWalletId,
      setWalletAddress,
    };
  }, [
    userId,
    nickname,
    imageURL,
    isLoggedIn,
    latitude,
    longitude,
    townName,
    walletId,
    walletAddress,
  ]);

  return (
    <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
  );
};
