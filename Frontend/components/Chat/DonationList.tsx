import React from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import {DonationInfo} from '../../constants/types';
import DonationItem from './DonationItem';

interface Props {
  donations: DonationInfo[];
  totalDonation: number;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: '20%',
  },
  text: {
    fontFamily: 'NanumSquareRoundR',
    fontWeight: 'bold',
    color: 'white',
    fontSize: 15,
    margin: 5,
  },
  title: {
    fontSize: 16,
    color: 'black',
  },
  cntText: {marginLeft: '5%'},
  textContainer: {marginLeft: '5%'},
  textRowContainer: {flexDirection: 'row', alignItems: 'center'},
});

const DonationList = ({donations, totalDonation}: Props) => {
  return (
    <View style={styles.container}>
      <FlatList
        data={donations}
        horizontal
        renderItem={donation => <DonationItem donation={donation.item} />}
        keyExtractor={item => String(item.supportId)}
      />
      <Text style={styles.text}>Total : {totalDonation} $</Text>
    </View>
  );
};

export default DonationList;
