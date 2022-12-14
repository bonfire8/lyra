import React, {useState} from 'react';
import {View, Alert, StyleSheet, Image as Img, ScrollView} from 'react-native';
import Colors from '../../constants/Colors';
import Button from '../Utils/Button';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import ImagePicker, {Image} from 'react-native-image-crop-picker';

export interface Photo {
  height: number;
  mime: string;
  modificationDate: string;
  path: string;
  size: number;
  width: number;
}
const Gallery = ({
  photos,
  SetPhotos,
}: {
  SetPhotos: (photos: Image[]) => void;
  photos: any[];
}) => {
  const [images, SetImages] = useState<any[] | undefined>(photos);
  const openPicker = async () => {
    try {
      const response = await ImagePicker.openPicker({
        mediaType: 'photo',
        width: 300,
        height: 300,
        cropping: true,
        multiple: true,
        maxFiles: 5,
      });
      SetImages(response);
      SetPhotos(response);
    } catch {}
  };

  return (
    <>
      <View>
        <ScrollView horizontal style={styles.viewCt}>
          <View style={styles.selectImg}>
            <Icon
              name="file-image-plus-outline"
              color={Colors.gray300}
              size={30}
              style={styles.imgIcon}
            />
            <Button
              title="업로드"
              btnSize="medium"
              textSize="large"
              isGradient={true}
              isOutlined={false}
              onPress={openPicker}
              customStyle={styles.button}
            />
          </View>
          {images.length === 0 ? (
            <></>
          ) : (
            <>
              {images.map(photo => (
                <Img
                  source={{uri: photo.path}}
                  style={styles.imgCnt}
                  key={photo.path}
                />
              ))}
            </>
          )}
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  viewCt: {
    marginStart: 20,
    marginEnd: 20,
  },
  text: {
    color: 'white',
  },
  imgCnt: {
    width: 150,
    height: 150,
    marginRight: 5,
    marginLeft: 5,
    borderRadius: 20,
  },
  button: {
    width: 100,
  },
  selectImg: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.purple300,
    borderRadius: 20,
    marginRight: 5,
  },
  imgIcon: {
    alignSelf: 'center',
    marginBottom: 10,
  },
});

export default Gallery;
