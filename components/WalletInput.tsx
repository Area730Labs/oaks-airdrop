import { 
    Container,
    Flex, 
    Box, 
    Text,
    Spacer,
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    Spinner,
    Center,
    Checkbox,
    VStack,
    Textarea,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Input,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
} from '@chakra-ui/react'
import {
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { API_URL } from '../config';
import { useState, useEffect } from 'react';
import { clusterApiUrl, PublicKey } from '@solana/web3.js';



//@ts-ignore
export default function WalletInput(props) {
    const [value, setValue] = useState('')
    const handleChange = (event:any) => setValue(event.target.value)

    return (
        <Center>
            <Input placeholder='Enter wallet' size='md' marginTop='5px' value={value} onChange={handleChange} />
            <Button size='sm' marginLeft='10px' colorScheme='red' onClick={props.onRemove}>
                Remove
            </Button>
        </Center>
    );
}