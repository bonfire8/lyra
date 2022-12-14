import React, {useState, useContext} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, CompositeNavigationProp} from '@react-navigation/native';

import {useMutation, useQuery, useQueryClient} from 'react-query';
import ImagePicker, {ImageOrVideo} from 'react-native-image-crop-picker';
import EncryptedStorage from 'react-native-encrypted-storage';
import IIcon from 'react-native-vector-icons/Ionicons';
import Clipboard from '@react-native-clipboard/clipboard';

import {
  ProfileStackNavigationProps,
  ProfileStackScreens,
  BottomTabNavigationProps,
  BottomTabScreens,
  PheedStackScreens,
} from '../../constants/types';
import {AuthContext} from '../../store/auth-context';
import {logoutFromServer, signOutWithKakao} from '../../api/auth';
import {
  getUserProfile,
  deleteWallet,
  createWallet,
  updateUserImg,
} from '../../api/profile';
import ProfilePhoto from '../../components/Utils/ProfilePhoto';
import ProfileInfoItem from '../../components/Profile/EditProfile/ProfileInfoItem';
import ModalWithButton from '../../components/Utils/ModalWithButton';
import Colors from '../../constants/Colors';

type NavigationProps = CompositeNavigationProp<
  ProfileStackNavigationProps,
  BottomTabNavigationProps
>;

const ProfileDetailScreen = () => {
  const navigation = useNavigation<NavigationProps>();
  const {
    setImageURL,
    setIsLoggedIn,
    setLatitude,
    setLongitude,
    setNickname,
    setUserId,
    userId,
  } = useContext(AuthContext);
  const [isLogoutModalVisible, setIsLogoutModalVisible] =
    useState<boolean>(false);
  const [isWalletModalVisible, setIsWalletModalVisible] =
    useState<boolean>(false);
  const [isWalletCreatedAgain, setIsWalletCreatedAgain] =
    useState<boolean>(false);

  const {
    data: profileData,
    isLoading: profileIsLoading,
    // isError,
  } = useQuery('userProfile', () => getUserProfile(userId!));

  const {mutate: userImgMutate, isLoading: userImgIsLoading} = useMutation(
    updateUserImg,
    {
      onSuccess: () => {
        queryClient.invalidateQueries('userProfile');
      },
    },
  );

  const nicknamePressHandler = () => {
    navigation.navigate(ProfileStackScreens.EditProfile, {
      param: 'nickname',
    });
  };

  const introductionPressHandler = () => {
    navigation.navigate(ProfileStackScreens.EditProfile, {
      param: 'introduction',
    });
  };

  const bankPressHandler = () => {
    navigation.navigate(ProfileStackScreens.EditProfile, {
      param: 'bank',
    });
  };

  const accountPressHandler = () => {
    navigation.navigate(ProfileStackScreens.EditProfile, {
      param: 'account',
    });
  };

  const holderPressHandler = () => {
    navigation.navigate(ProfileStackScreens.EditProfile, {
      param: 'holder',
    });
  };

  const ChangeProfileImagePressHandler = async () => {
    let newProfileImage: ImageOrVideo;
    try {
      newProfileImage = await ImagePicker.openPicker({
        width: 300,
        height: 300,
        cropping: true,
        mediaType: 'photo',
        cropperCircleOverlay: true,
        compressImageQuality: 0.8,
      });
      const imageUri = newProfileImage.path;
      const pathParts = imageUri.split('/');
      userImgMutate({
        userId: userId!,
        imageUri,
        imageType: newProfileImage.mime,
        imageName: pathParts[pathParts.length - 1],
      });
    } catch (error) {
      if (__DEV__) {
        console.error(error);
      }
    }
  };

  const queryClient = useQueryClient();

  const {
    data: createWalletData,
    mutate: createWalletMutate,
    isLoading: createWalletIsLoading,
    // isError: createWalletIsError,
  } = useMutation(createWallet, {
    onSuccess: () => {
      queryClient.invalidateQueries('walletInfo');
      setIsWalletCreatedAgain(true);
    },
  });

  const {
    // data: deleteWalletData,
    mutate: deleteWalletMutate,
    isLoading: deleteWalletIsLoading,
    // isError: deleteWalletIsError,
  } = useMutation(deleteWallet, {
    onSuccess: () => {
      createWalletMutate(userId!);
    },
  });

  const walletCreationAgainHandler = () => {
    deleteWalletMutate(userId!);
  };

  const closeWalletCreationAgainModal = () => {
    setIsWalletCreatedAgain(false);
    setIsWalletModalVisible(false);
  };

  const walletCreationAgainWarning = isWalletCreatedAgain
    ? '??? ?????? ?????? ?????????????????????. ????????? ????????? ?????? ?????? ?????? ????????? ?????????.'
    : '????????? ??????????????? ????????? ?????? ????????? ?????? ????????? ????????????, ????????? ?????? ?????? ???????????????. Lyra??? ?????? ???????????? ?????? ????????? ???????????? ????????? ????????? ?????? ????????????. ?????? ?????? ???????????? ???????????? ???????????? ????????? ???????????? ?????????.';

  const copyToClipboard = () => {
    Clipboard.setString(createWalletData?.privateKey);
  };

  const logoutHandler = async () => {
    try {
      const refreshToken = await EncryptedStorage.getItem('refreshToken');
      await logoutFromServer(refreshToken);
      await signOutWithKakao();
      await EncryptedStorage.removeItem('refreshToken');
      await EncryptedStorage.removeItem('accessToken');
      setUserId(null);
      setNickname(null);
      setImageURL(null);
      setIsLoggedIn(false);
      setLatitude(null);
      setLongitude(null);
      navigation.navigate(BottomTabScreens.Home, {
        screen: PheedStackScreens.Login,
      });
    } catch (err) {
      if (__DEV__) {
        console.error('Logout Error!', err);
      }
    } finally {
      setIsLogoutModalVisible(false);
    }
  };

  const isLoading =
    createWalletIsLoading ||
    deleteWalletIsLoading ||
    profileIsLoading ||
    userImgIsLoading;

  return (
    <>
      <ModalWithButton
        isModalVisible={isWalletModalVisible}
        setIsModalVisible={setIsWalletModalVisible}
        leftText={isWalletCreatedAgain ? '??????' : '????????????'}
        onLeftPress={
          isWalletCreatedAgain
            ? closeWalletCreationAgainModal
            : () => setIsWalletModalVisible(false)
        }
        rightText={isWalletCreatedAgain ? '????????????' : '????????????'}
        onRightPress={
          isWalletCreatedAgain ? copyToClipboard : walletCreationAgainHandler
        }>
        {isLoading ? (
          <ActivityIndicator
            style={styles.spinner}
            size="large"
            animating={isLoading}
            color={Colors.purple300}
          />
        ) : null}
        {!isWalletCreatedAgain ? (
          <IIcon name="ios-warning-outline" size={25} color={Colors.pink500} />
        ) : (
          <Text style={styles.newPrivateKey}>
            {createWalletData?.privateKey || ''}
          </Text>
        )}
        <Text
          style={[
            styles.text,
            styles.modalText,
            isWalletCreatedAgain && styles.newPrivateKeyText,
          ]}>
          {walletCreationAgainWarning}
        </Text>
      </ModalWithButton>
      <ModalWithButton
        isModalVisible={isLogoutModalVisible}
        setIsModalVisible={setIsLogoutModalVisible}
        leftText="????????????"
        onLeftPress={() => setIsLogoutModalVisible(false)}
        rightText="????????????"
        onRightPress={logoutHandler}>
        <Text style={styles.text}>?????? ???????????? ????????????????</Text>
      </ModalWithButton>
      <ScrollView style={styles.screen}>
        <View style={styles.profileImageContainer}>
          <ProfilePhoto
            size="extraLarge"
            grade="normal"
            isGradient={true}
            imageURI={profileData?.image_url}
            profileUserId={userId!}
          />
          <Pressable
            style={styles.changePhoto}
            onPress={ChangeProfileImagePressHandler}>
            <Text style={styles.text}>?????? ?????????</Text>
          </Pressable>
        </View>
        <View style={styles.seperator} />
        <View style={styles.itemContainer}>
          <ProfileInfoItem
            title="?????????"
            content={profileData?.nickname || ''}
            onLongPress={nicknamePressHandler}
          />
          <ProfileInfoItem
            title="??????"
            content={profileData?.introduction || ''}
            placeHolder="????????? ??????????????????."
            onLongPress={introductionPressHandler}
          />
          {/* <ProfileInfoItem
            title="??????"
            content={profileData?.bank || ''}
            placeHolder="????????? ???????????????."
            onLongPress={bankPressHandler}
          />
          <ProfileInfoItem
            title=""
            content={profileData?.account || ''}
            placeHolder="?????? ????????? ???????????????."
            onLongPress={accountPressHandler}
          />
          <ProfileInfoItem
            title=""
            content={profileData?.holder || ''}
            placeHolder="???????????? ???????????????."
            onLongPress={holderPressHandler}
          /> */}
          <View style={styles.buttomSeperator} />
          <Pressable
            onPress={() => setIsWalletModalVisible(true)}
            style={styles.button}>
            <Text style={[styles.text, styles.buttonText]}>
              ?????? ????????? ??????
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setIsLogoutModalVisible(true)}
            style={[styles.button, styles.lastButton]}>
            <Text style={[styles.text, styles.buttonText]}>????????????</Text>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.black500,
    paddingBottom: '15%',
  },
  changePhoto: {
    marginBottom: 8,
  },
  image: {
    width: 150,
    height: 150,
  },
  text: {
    marginTop: 8,
    fontFamily: 'NanumSquareRoundR',
    fontSize: 16,
    color: 'white',
  },
  profileImageContainer: {
    width: '100%',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContainer: {
    paddingVertical: 8,
  },
  modalText: {
    padding: 8,
    lineHeight: 20,
    textAlign: 'justify',
  },
  newPrivateKey: {
    paddingTop: 8,
    paddingHorizontal: 14,
    textAlign: 'center',
    color: Colors.pink500,
    fontFamily: 'NanumSquareRoundR',
  },
  newPrivateKeyText: {
    textAlign: 'center',
  },
  seperator: {
    width: '100%',
    height: 1,
    backgroundColor: '#bb92e273',
  },
  buttomSeperator: {
    width: '100%',
    height: 1,
    backgroundColor: '#bb92e273',
    // marginTop: 50,
  },
  button: {
    paddingTop: 8,
    marginLeft: 16,
  },
  buttonText: {
    color: Colors.pink300,
  },
  lastButton: {
    paddingBottom: 16,
  },
  spinner: {
    position: 'absolute',
    left: '50%',
    top: '60%',
  },
});

export default ProfileDetailScreen;
