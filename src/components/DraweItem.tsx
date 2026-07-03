import React from 'react';

import { TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';

const DrawerItem: React.FC<{
    title: string;
    press: Function;
    selected: boolean
}> = ({ press, title, selected = false }) => {
    return (
        <TouchableOpacity onPress={() => press()}>
            <Text
                style={{
                    fontSize: 16,
                    fontWeight: selected ? "700" : '400',
                    paddingVertical: 10,
                    lineHeight: 20,
                    textAlign: 'left',
                    color: '#FFF',
                }}>
                {title}
            </Text>
        </TouchableOpacity>
    );
};
export default DrawerItem;
