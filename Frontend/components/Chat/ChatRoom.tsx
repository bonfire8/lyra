import React, {
  useState,
  useCallback,
  useEffect,
  useContext,
  useRef,
} from 'react';
import {
  ImageBackground,
  View,
  Dimensions,
  Image,
  StyleSheet,
  TouchableOpacity,
  GestureResponderEvent,
  Animated,
} from 'react-native';
import {GiftedChat, InputToolbar, User} from 'react-native-gifted-chat';
import {DonationInfo, IMessage} from '../../constants/types';
import CircleGradient from '../Utils/CircleGradient';
import CustomBubble from './CustomBubble';
import CustomMessage from './CustomMessage';
import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';
import {Socket} from 'socket.io-client';
import {AuthContext} from '../../store/auth-context';
import DonationModal from './DonationModal';
import LottieView from 'lottie-react-native';
import {
  getTotalBalanceFromWeb3,
  getUserWalletAddressAndCoin,
} from '../../api/profile';
import {
  getChatDonations,
  getLiveChatPheedUser,
  giveDonation,
  sendDonationWeb3,
} from '../../api/chat';
import DonationList from './DonationList';
import {useIsFocused} from '@react-navigation/native';

const deviceHeight = Dimensions.get('window').height;
const deviceWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  heartBtn: {
    position: 'absolute',
    bottom: 60,
    right: '5%',
    zIndex: 2,
  },
  inputToolbar: {
    left: '5%',
    right: '5%',
    borderRadius: 25,
    marginTop: '-10%',
  },
  container: {height: '100%', bottom: 70},
  donationImg: {marginLeft: 15, marginVertical: 15},
  heart: {
    position: 'absolute',
    width: 100,
    right: '10%',
    bottom: '-20%',
    height: deviceHeight,
  },
});

interface Props {
  socket: Socket;
  buskerId: number;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatRoom = ({socket, buskerId, setIsLoading}: Props) => {
  const [totalMessages, setMessages] = useState<IMessage[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [myInfo] = useState<User>({
    _id: useContext(AuthContext).userId!,
    name: useContext(AuthContext).nickname!,
    avatar: useContext(AuthContext).imageURL!,
  });
  const {walletAddress} = useContext(AuthContext);
  const [buskerWalletAddress, setBuskerWalletAddress] = useState('');
  const progress1 = useRef(new Animated.Value(0)).current;
  const progress2 = useRef(new Animated.Value(0)).current;
  const progress3 = useRef(new Animated.Value(0)).current;
  const progress4 = useRef(new Animated.Value(0)).current;
  const progress5 = useRef(new Animated.Value(0)).current;
  const heartId = useRef(0);
  const [warningMsg, setWarningMsg] = useState('');
  const [balance, setBalance] = useState(0);
  const [pheedId, setPheedId] = useState('');
  const [donations, setDonations] = useState<DonationInfo[]>([]);
  const [totalDonation, setTotalDonation] = useState(0);
  const [isDonationLoading, setIsDonationLoading] = useState(false);
  const isFocused = useIsFocused();
  // ?????? ??????
  const onSend = (messages: IMessage[]) => {
    const message = messages[0];
    socket.emit('send message', {...message, user: myInfo}, buskerId);
  };
  // ?????? ??????
  const sendDonation = async (
    myPrivateKey: string,
    message: string,
    donation: string,
  ) => {
    setIsDonationLoading(true);
    // check
    if (!/^[0-9]*$/.test(donation)) {
      setWarningMsg('????????? ??????????????????!');
      setIsDonationLoading(false);
      return;
    }

    if (Number(donation) === 0) {
      setWarningMsg('0?????? ??? ????????? ??????????????????!');
      setIsDonationLoading(false);
      return;
    }

    if (Number(donation) > balance) {
      setWarningMsg('????????? ???????????????!');
      setIsDonationLoading(false);
      return;
    }
    let ca = '';
    try {
      const data = await sendDonationWeb3(
        myPrivateKey,
        buskerWalletAddress,
        Number(donation),
      );
      ca = data.blockHash;
    } catch (error) {
      console.log(error);
      setWarningMsg('???????????? ?????? ??????????????????!');
      return;
    }
    // ????????? ???????????? ?????? ??????
    await giveDonation(pheedId, {
      ca: ca,
      coin: Number(donation),
      content: message,
      supporterId: Number(myInfo._id),
    }).catch(err => {
      console.log('????????? ?????? ?????? ??????', err);
    });

    socket.emit(
      'send message',
      {
        _id: uuidv4(),
        user: myInfo,
        createdAt: new Date(),
        text: message,
        donation: donation,
      },
      buskerId,
    );
    setWarningMsg('');
    setIsLoading(false);
    setModalVisible(false);
  };

  // ?????? ?????????
  const heartUp = useCallback(() => {
    heartId.current += 1;
    heartId.current %= 5;
    const progress = [progress1, progress2, progress3, progress4, progress5];
    const clickHeart = progress[heartId.current];
    Animated.timing(clickHeart, {
      toValue: 0.5,
      duration: 1000,
      useNativeDriver: true,
    }).start();
    setTimeout(() => {
      clickHeart.setValue(0);
    }, 1000);
  }, [progress1, progress2, progress3, progress4, progress5]);

  // ?????? ??????
  const participateChat = useCallback(() => {
    socket.emit('enter room', buskerId);
    // ????????? ??????
    socket.on('receive message', (msg: IMessage) => {
      setMessages(prvMessages => [msg, ...prvMessages]);
      // ?????? ?????? ?????? ??? ????????? ?????? ????????????!
      if (msg.donation) {
        getChatDonations(pheedId).then(res => {
          setDonations(res.data.reverse());
          setTotalDonation(res.message);
          // ????????? ?????? ????????????
          if (walletAddress) {
            getTotalBalanceFromWeb3(walletAddress)
              .then(bal => {
                setBalance(bal);
              })
              .catch(err => console.log(err));
          }
        });
      }
    });
    socket.on('heart', () => {
      heartUp();
    });
  }, [socket, buskerId, pheedId, walletAddress, heartUp]);

  // ????????? ?????? ?????? ????????????
  const fetchBuskerWalletAddress = useCallback(async () => {
    try {
      const walletInfo = await getUserWalletAddressAndCoin(buskerId);
      const address = walletInfo.address;
      setBuskerWalletAddress(address);
    } catch (error) {
      console.log('busker ?????? ?????? ????????????', error);
    }
  }, [buskerId]);

  useEffect(() => {
    // ???????????? ???????????? ?????? ??????!
    const start = async () => {
      setIsLoading(true);
      setMessages([]);
      participateChat();
      // ?????? ?????? ????????????
      if (walletAddress) {
        await getTotalBalanceFromWeb3(walletAddress)
          .then(bal => {
            setBalance(bal);
          })
          .catch(err => console.log('?????? ????????????', err));
      }
      // ????????? ?????? ?????? ????????????
      await fetchBuskerWalletAddress();
      // ?????? id ???????????? ???????????? ??????
      await getLiveChatPheedUser(String(buskerId))
        .then(async pheed => {
          setPheedId(pheed[0].pheedId);
          await getChatDonations(pheed[0].pheedId)
            .then(res => {
              setDonations(res.data.reverse());
              setTotalDonation(res.message);
            })
            .catch(err => console.log('???????????? ???????????? ??????', err));
        })
        .catch(err => {
          console.log('?????? id ???????????? ??????', err);
        });
      setIsLoading(false);
    };
    start();
    return () => {
      socket.removeAllListeners('receive message');
      socket.removeAllListeners('fetch user');
      socket.removeAllListeners('heart');
      socket.removeAllListeners('end');
    };
  }, [
    participateChat,
    socket,
    walletAddress,
    fetchBuskerWalletAddress,
    buskerId,
    setIsLoading,
    isFocused,
  ]);

  // ???????????? ?????????
  const renderBubble = (props: any) => {
    return (
      <CustomBubble
        {...props}
        textStyle={
          props.currentMessage!.donation
            ? {
                left: {
                  color: 'white',
                },
              }
            : {
                left: {
                  maxWidth: deviceWidth * 0.5,
                },
              }
        }
      />
    );
  };

  // ????????? ?????????
  const renderInputToolbar = (props: any) => {
    return <InputToolbar {...props} containerStyle={[styles.inputToolbar]} />;
  };

  // ????????? ?????????
  const renderMessage = (props: any) => {
    return <CustomMessage {...props} />;
  };

  // ???????????? ?????? ??????
  const clickDonationHandler = (event: GestureResponderEvent) => {
    event.preventDefault();
    setModalVisible(true);
  };

  // ?????? ????????? ?????? ??????
  const clickHeartHandler = () => {
    socket.emit('heart', buskerId);
  };

  return (
    <ImageBackground
      resizeMode="cover"
      source={require('../../assets/image/chatBackGroundImg.jpg')}>
      <View style={styles.container}>
        <DonationList donations={donations} totalDonation={totalDonation} />
        <GiftedChat
          messages={totalMessages}
          onSend={onSend}
          showUserAvatar={true}
          showAvatarForEveryMessage={true}
          renderUsernameOnMessage={true}
          renderBubble={renderBubble}
          renderInputToolbar={renderInputToolbar}
          user={{
            _id: -1, // ????????? ????????? ????????? ??????(?????? ?????????!!)
          }}
          renderMessage={renderMessage}
          renderActions={() => (
            <TouchableOpacity
              onPress={clickDonationHandler}
              style={styles.donationImg}>
              <Image source={require('../../assets/image/donationImg.png')} />
            </TouchableOpacity>
          )}
          placeholder={''}
        />
        <View style={styles.heartBtn}>
          <TouchableOpacity onPress={clickHeartHandler}>
            <CircleGradient grade="normal" size="medium">
              <Image source={require('../../assets/image/heartImg.png')} />
            </CircleGradient>
          </TouchableOpacity>
        </View>
        <LottieView
          style={styles.heart}
          source={require('./81755-hearts-feedback.json')}
          progress={progress1}
        />
        <LottieView
          style={styles.heart}
          source={require('./81755-hearts-feedback.json')}
          progress={progress2}
        />
        <LottieView
          style={styles.heart}
          source={require('./81755-hearts-feedback.json')}
          progress={progress3}
        />
        <LottieView
          style={styles.heart}
          source={require('./81755-hearts-feedback.json')}
          progress={progress4}
        />
        <LottieView
          style={styles.heart}
          source={require('./81755-hearts-feedback.json')}
          progress={progress5}
        />
      </View>
      <DonationModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        sendDonation={sendDonation}
        warningMsg={warningMsg}
        setWarningMsg={setWarningMsg}
        balance={balance}
        isDonationLoading={isDonationLoading}
      />
    </ImageBackground>
  );
};

export default ChatRoom;
