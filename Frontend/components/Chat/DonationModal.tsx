import React, {Dispatch, SetStateAction, useState} from 'react';
import {Dimensions, Modal, StyleSheet, Text, View} from 'react-native';
import Colors from '../../constants/Colors';
import Button from '../Utils/Button';
import Input from '../Utils/Input';

interface Props {
  modalVisible: boolean;
  setModalVisible: Dispatch<SetStateAction<boolean>>;
  sendDonation: (message: string, donation: number) => void;
}

const DonationModal = ({
  modalVisible,
  setModalVisible,
  sendDonation,
}: Props) => {
  const [message, setMessage] = useState('');
  const [donation, setDonation] = useState('');
  return (
    <View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View
          style={styles.blankSpace}
          onTouchEnd={() => {
            setModalVisible(false);
            setDonation('');
            setMessage('');
          }}
        />
        <View style={styles.bottomView}>
          <View style={styles.modalView}>
            <Text style={[styles.modalText, styles.titleText]}>후원하기</Text>
            <Text style={styles.modalText}>
              금액 및 메시지가 공개적으로 표시됩니다.
            </Text>
            <Input
              setEnteredValue={setDonation}
              enteredValue={donation}
              width={0.77}
              height={0.06}
              borderRadius={25}
              keyboard={2}
              placeholder="$ 1 (최소 금액)"
              customStyle={styles.input}
              maxLength={10}
            />
            <Text style={styles.modalText}>메시지</Text>
            <Input
              setEnteredValue={setMessage}
              enteredValue={message}
              width={0.77}
              height={0.06}
              borderRadius={25}
              keyboard={1}
              placeholder="메시지를 입력해주세요."
              customStyle={styles.input}
              maxLength={30}
            />
            <Button
              title="후원하기"
              btnSize="extraLarge"
              textSize="extraLarge"
              isOutlined={false}
              isGradient={true}
              customStyle={styles.button}
              onPress={() => sendDonation(message, Number(donation))}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomView: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: Colors.black500,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
    paddingBottom: 30,
    alignItems: 'center',
    width: '100%',
    borderColor: Colors.purple300,
    borderWidth: 1,
  },
  button: {
    width: 300,
  },
  modalText: {
    color: 'white',
    marginBottom: 15,
    width: '80%',
  },
  titleText: {
    fontSize: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 20,
  },
  blankSpace: {
    position: 'absolute',
    width: Dimensions.get('screen').width,
    height: Dimensions.get('screen').height,
    backgroundColor: '#000000',
    opacity: 0.5,
  },
});
export default DonationModal;