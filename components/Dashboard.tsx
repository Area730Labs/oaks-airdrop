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
    useToast
} from '@chakra-ui/react'
import {
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { API_URL } from '../config';
import { useState, useEffect } from 'react';
import { clusterApiUrl, PublicKey } from '@solana/web3.js';


//@ts-ignore
export default function Dashboard(props) {
    const { publicKey, signMessage } = useWallet();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedServers, setSelectedServers] = useState([]);
    const [solValue, setSolValue] = useState(30)
    const [minNftValue, setMinNftValue] = useState(3)
    const handleSolValueChange = (value: any) => setSolValue(value);
    const handleMinNftValueChange = (value: any) => setMinNftValue(value);
    const [sidebarContent, setSidebarContent] = useState([]);
    const [appData, setData] = useState(null);
    const [selectedMints, setSelectedMints] = useState([]);
    const [customWallets, setCustomWallets] = useState([]);
    const [counter, setCounter] = useState(0);
    const [customWalletData, setCustomWalletData]: [{
        [key: number]: string,
       }, any] = useState({});

    //@ts-ignore
    const [calcData, setCalcData]: [
        {
            holdersCount: number,
            mintsCount: number,
            solPerNft: Number
        }, any
    ] = useState({});
    const [holderData, setHolderData] = useState({});
    const toast = useToast()

    const { isOpen: isApproveOpen , onOpen: onApproveOpen, onClose: onApproveClose } = useDisclosure()


    const { connection } = useConnection();

    useEffect(() => {
        let optionCount = 0;

        for (const [traitName, value] of Object.entries(props.data.attributes)){
            //@ts-ignore
            for (const [traitValue, _] of Object.entries(value)){
                optionCount++;
            }
        }

        //@ts-ignore
        setSelectedServers(new Array(optionCount).fill(false));
    }, []);

    useEffect(() => {
        let newData = [];
        let content = [];
        let choiceIndex = 0;
        for (const [traitName, value] of Object.entries(props.data.attributes)){
            if (traitName != 'Body') {
                continue;
            }
            let options = []
            //@ts-ignore
            for (const [traitValue, _] of Object.entries(value)){
                const i = choiceIndex;
                options.push(<Checkbox key={i} isChecked={selectedServers[i]}  onChange={(e) => checkboxHandler(e, i)} width='100%'><Box as='span' display='block' height='25px' textAlign='left' overflow='hidden'>{traitValue}</Box></Checkbox>);
                choiceIndex++;

                newData.push({
                    traitName: traitName,
                    traitVal: traitValue
                });
            }

            content.push(
                <AccordionItem key={traitName}>
                    <h2>
                    <AccordionButton>
                        <Box flex='1' textAlign='left'>
                        {traitName}
                        </Box>
                        <AccordionIcon />
                    </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                        {options}
                    </AccordionPanel>
                </AccordionItem>
            );
        }

        //@ts-ignore
        setSidebarContent(content);

        //@ts-ignore
        setData(newData);
    }, [selectedServers]);

    const removeCustomWallet = (i: any) => {
        const newArray:any[] = Array.from(customWallets);
        var index = newArray.indexOf(i);
        if (index > -1) { //if found
            newArray.splice(index, 1);
        }

        //@ts-ignore
        setCustomWallets(newArray);
    };

    const handleInputChange = (event:any, index:number) => {
        let x = {
            ...customWalletData
        };

        x[index] = event.target.value;

        console.log(x);

        setCustomWalletData(x);
    };

    const addCustomWallet = () => {
        const newArray:any[] = Array.from(customWallets);
        const index = counter + 1;
        setCounter(index);

        newArray.push(index);

        //@ts-ignore
        setCustomWallets(newArray);
    };

    const errorToast = () => {
        toast({
            title: 'Error',
            status: 'error',
            duration: 9000,
            isClosable: true,
          })
    };


    const onOkHandler = async () => {
        onApproveClose();

        onOpen();

        if (!signMessage || !publicKey) {
            console.error('>> First connect a wallet');
            onClose();
            return;
        }

        try {    
            const payload = {
                'sol_amount': solValue,
                'holders': holderData,
                'wallet': publicKey.toString(),
            };

            const res = await (await fetch(`${API_URL}/oak_send_drop`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })).json();

            if (Object.hasOwn(res, 'error')) {
                errorToast();
            } else {
               console.log(res)

               toast({
                title: 'Airdrop created',
                status: 'success',
                duration: 9000,
                isClosable: true,
              })
            }
        } catch (error) {
            console.log(error);

            errorToast();
        } finally {
            onClose();
        }
    };

    const onCalculate = async () => {
        onOpen();

        try {    
            let choices: any[] = [];
            selectedServers.forEach((val: string, index) => {
                //@ts-ignore
                if (val && appData[index].traitVal.trim().length > 0) {
                    //@ts-ignore
                    choices.push(appData[index].traitVal);
                }
            });


            let wl_wallets: any[] = []

            customWallets.forEach((elem:number) => {
                const v = customWalletData[elem]
                if (v) {
                    wl_wallets.push(v);
                }
            });


            const data = {
                'traits': choices,
                'wallets': wl_wallets,
                'min_nft_count': minNftValue
            };


            const res = await (await fetch(`${API_URL}/oak_drop_calculate`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })).json();

            if (Object.hasOwn(res, 'error')) {
                console.log('Failed to get data');
                errorToast();
            } else {
                console.log(res.data.length);

                let uniqueMints = new Set();
                let holder_count = res.data.length;

                res.data.forEach((item:any) => {
                    item.mints.reduce((s:any, e:any) => s.add(e), uniqueMints);
                });

                const pricePerNft = solValue / uniqueMints.size;
                let cd = {
                    mintsCount: uniqueMints.size,
                    holdersCount: holder_count,
                    solPerNft: parseFloat(pricePerNft.toFixed(7))
                };

                setCalcData(cd);

                setHolderData(res.data);

                onApproveOpen();
            }
        } catch (error) {
            console.log(error);

            errorToast();
        } finally {
            onClose();
        }
    };


    const checkboxHandler = (e: any, id: any) => {
        const newArray:any[] = Array.from(selectedServers);
        newArray[id] = e.target.checked;

        //@ts-ignore
        setSelectedServers(newArray);
    };

    const selectAll = () => {
        const newArray:any[] = Array.from(selectedServers);
        newArray.forEach((elem, id) => {
            newArray[id] = true;
        });

        //@ts-ignore
        setSelectedServers(newArray);
    };

    const unselectAll = () => {
        const newArray:any[] = Array.from(selectedServers);
        newArray.forEach((elem, id) => newArray[id] = false);

        //@ts-ignore
        setSelectedServers(newArray);
    };

    let label = "";
    if (calcData.solPerNft){
        label = `${calcData.solPerNft} SOL`;
    }

    return (
        <>
         <Modal onClose={() => {}} isOpen={isOpen} isCentered size='xs'>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader textAlign="center">Loading...</ModalHeader>

                <ModalBody textAlign="center">
                    <Spinner />
                </ModalBody>
            </ModalContent>
        </Modal>

        <Modal onClose={() => {}} isOpen={isApproveOpen} isCentered size='sm'>
            <ModalOverlay />
                <ModalContent>
                <ModalHeader>Summary</ModalHeader>
                <ModalBody>
                    <Flex>
                        <Text width='150px' fontWeight='bold'>Total holders:</Text>
                        
                        <Text fontWeight='bold'>{calcData.holdersCount}</Text>
                    </Flex>
                    <Flex>
                        <Text width='150px' fontWeight='bold'>Total NFTs:</Text>
                        <Text fontWeight='bold'>{calcData.mintsCount}</Text>
                    </Flex>
                    <Flex>
                        <Text width='150px' fontWeight='bold'>SOL per NFT:</Text>
                        <Text fontWeight='bold'>{label}</Text>
                    </Flex>
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme='blue' mr={3} onClick={onOkHandler}>
                        Run airdrop
                    </Button>
                    <Button onClick={onApproveClose}>Cancel</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
        
        <Container maxW="800px" marginTop="100px" backgroundColor="white" borderRadius="10px" paddingTop="25px"  textAlign="center">
            <Flex paddingBottom='25px'>
                <VStack alignContent='flex-start' w='300px' bg='green.500' height='500px' backgroundColor='white' borderRadius='10px 0 0 10px' padding='10px' overflowY='scroll'>
                    <Text fontWeight='bold' fontSize='18px' paddingBottom='5px'>Select traits</Text>

                    <Accordion defaultIndex={[0]} allowMultiple minW='100%'>
                        {sidebarContent}
                    </Accordion>
                   
                </VStack>
                <VStack flex='1' padding='10px' width='100%' alignItems='left' spacing='15px'>
                   
                    <Box width='100%'>
                            <Text mb='8px' textAlign='left'>Total SOL amount to drop</Text>
                            <NumberInput step={0.1} min={0} value={solValue} onChange={handleSolValueChange}>
                                <NumberInputField />
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                    </Box>
                

                    <Box width='100%'>
                            <Text mb='8px' textAlign='left'>Mininum NFTs required in addition to traits</Text>
                            <NumberInput  defaultValue={3} min={0} value={minNftValue} onChange={handleMinNftValueChange}>
                                <NumberInputField />
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                    </Box>

                    <Flex>
                        <Text mb='8px' textAlign='left' fontWeight='bold'>Custom wallets:</Text>
                        <Spacer/>
                        <Button size='sm' colorScheme='green' onClick={addCustomWallet}>
                            Add
                        </Button>
                    </Flex>
                    <Box height='200px' overflowY ='scroll' padding='5px'>
                        {customWallets.map((elem) => (
                            <Center key={elem}>
                                <Input placeholder='Enter wallet' size='md' marginTop='5px' value={customWalletData[elem] || ""} onChange={(event) => handleInputChange(event, elem)} />
                                <Button size='sm' marginLeft='10px' colorScheme='red' onClick={() => removeCustomWallet(elem)}>
                                    Remove
                                </Button>
                            </Center>
                        ))}
                    </Box>
                </VStack>
            </Flex>

            <Flex paddingBottom='20px'>
                <Button colorScheme='gray' size='sm' onClick={selectAll}>
                    Select all
                </Button>
                <Button colorScheme='gray' size='sm' marginLeft='15px' onClick={unselectAll}>
                    Unselect all
                </Button>

                <Spacer/>

                <Button colorScheme='telegram' onClick={onCalculate} > 
                    Send drop
                </Button>
            </Flex>
          
        </Container>
       </>
    );
}