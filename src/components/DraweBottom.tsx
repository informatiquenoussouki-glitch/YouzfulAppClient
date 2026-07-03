import React from 'react';
import { useTranslation } from 'react-i18next';

import { View } from 'react-native';
import { Text } from 'react-native-paper';

const DrawerBottom: React.FC<{}> = () => {
      const { t } = useTranslation();
    
    return (
        <View style={{ bottom: 85 }}>
            <Text
                style={{
                    fontSize: 14,
                    fontWeight: '400',
                    lineHeight: 15,
                    paddingVertical: 15,
                    textAlign: 'center',
                    color: '#FFF',
                }}>
                {t("version")}
            </Text>
            <Text
                style={{
                    fontSize: 14,
                    fontWeight: '400',
                    lineHeight: 15,
                    textAlign: 'center',
                    color: '#FFF',
                }}>
                {t("rights")}
            </Text>
        </View>
    );
};
export default DrawerBottom;
