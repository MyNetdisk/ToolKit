import React, { useEffect, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import Modal from 'react-native-modal'
import YModal, { tipQueue } from '.'

export default function ModalContainer() {
  const [refresh, setRefresh] = useState(0)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const tipsListener = () => {
      if (tipQueue.length > 0) {
        // StatusBar.setHidden(true, 'none')
      } else {
        // StatusBar.setHidden(false, 'slide')
      }
      setVisible(tipQueue.length > 0)
      setRefresh(refresh + 1)
    }
    tipQueue.addListener(tipsListener)
    return () => {
      tipQueue.removeListener(tipsListener)
    }
  })
  return (
    <Modal
      animationIn='fadeIn'
      animationOut='fadeOut'
      animationInTiming={400}
      animationOutTiming={200}
      hasBackdrop={false}
      style={{ margin: 0 }}
      coverScreen={true}
      isVisible={visible}
    >
      <View style={styles.mask}>
        {tipQueue.map((m, i) => {
          const { element, maskUnClosable, maskColor, onMaskPress } = m
          return (
            <View style={styles.container} key={m.id}>
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => {
                  onMaskPress?.()
                  if (maskUnClosable) return
                  YModal.close?.()
                }}
                style={[styles.tb, { backgroundColor: maskColor || '#3330' }]}
              />
              {element}
            </View>
          )
        })}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  mask: {
    flex: 1,
    // width: '100%',
    // height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3336'
  },
  tb: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  }
})
