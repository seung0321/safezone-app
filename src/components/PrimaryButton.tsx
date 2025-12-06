// src/components/PrimaryButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/Colors';

interface PrimaryButtonProps {
    title: string;
    onPress: () => void;
    style?: object;
    textStyle?: object;
    disabled?: boolean;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ 
    title, 
    onPress, 
    style, 
    textStyle,
    disabled = false 
}) => {
    return (
        <TouchableOpacity 
            onPress={onPress} 
            activeOpacity={0.8} 
            style={[styles.button, style]}
            disabled={disabled}
        >
            <LinearGradient
                colors={disabled 
                    ? ['#555', '#666'] 
                    : [Colors.accentPrimary, Colors.accentSecondary]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
            >
                <Text style={[styles.text, textStyle, disabled && styles.textDisabled]}>
                    {title}
                </Text>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: Colors.accentPrimary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
        elevation: 8,
    },
    gradient: {
        paddingVertical: 14,
        paddingHorizontal: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
    textDisabled: {
        opacity: 0.6,
    },
});

export default PrimaryButton;