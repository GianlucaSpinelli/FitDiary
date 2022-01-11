import {
    Box,
    Button,
    FormControl,
    FormLabel,
    GridItem,
    Heading,
    HStack,
    Input,
    SimpleGrid,
    Text,
    useToast,
    VStack
} from "@chakra-ui/react";
import {useForm} from "react-hook-form"
import React, {useCallback, useContext, useEffect, useState} from "react";
import {useDropzone} from 'react-dropzone';
import {FetchContext} from "../../context/FetchContext";
import {CloseIcon} from "@chakra-ui/icons";
import Select from "react-select";
import {GradientBar} from "../../components/GradientBar";

const urlProtocolli = "protocolli";
const urlUtenti = "utenti";

const Create = () => {
    const fetchContext = useContext(FetchContext);
    const [options, setOptions] = useState([{}]);
    const [isLoading, setisLoading] = useState(false);
    const [selectedFileAllenamento, setselectedFileAllenamento] = useState(null);
    const [selectedFileAlimentare, setselectedFileAlimentare] = useState(null);
    const {handleSubmit, register, setValue} = useForm();
    const toast = useToast({
        duration: 3000, isClosable: true, variant: "solid", position: "top", containerStyle: {
            width: '100%', maxWidth: '100%',
        },
    })

    function toastParam(title, description, status) {
        return {
            title: title, description: description, status: status
        };
    }

    const onDropAllenamento = useCallback(acceptedFileAllenamento => {
        console.log(acceptedFileAllenamento)
        setValue("fileAllenamento", acceptedFileAllenamento);
    }, [setValue])
    const onDropAlimentare = useCallback(acceptedFileAlimentare => {
        console.log(acceptedFileAlimentare)
        setValue("schedaAlimentare", acceptedFileAlimentare);
    }, [setValue])
    const {
        acceptedFiles: acceptedFileAllenamento,
        getRootProps: getRootPropsAllenamento,
        getInputProps: getInputPropsAllenamento,
        isDragActive: isDragActiveAllenamento
    } = useDropzone({onDrop: onDropAllenamento, maxFiles: 1})
    const {
        acceptedFiles: acceptedFileAlimentare,
        getRootProps: getRootPropsAlimentare,
        getInputProps: getInputPropsAlimentare,
        isDragActive: isDragActiveAlimentare
    } = useDropzone({onDrop: onDropAlimentare, maxFiles: 1})

    const onSubmit = async (values) => {
        const formData = new FormData();
        console.log(values);
        formData.append("dataScadenza", values.dataScadenza)
        formData.append("idCliente", values.idCliente)
        if (values.schedaAllenamento)
            formData.append("schedaAllenamento", values.schedaAllenamento[0])
        if (values.schedaAlimentare)
            formData.append("schedaAlimentare", values.schedaAlimentare[0])
        try {
            const {data} = await fetchContext.authAxios.post(urlProtocolli, formData)
            console.log(data);
            toast(toastParam("Creato!", "Protocollo creato correttamente", data.status))
        } catch (error) {
            console.log(error.response);
            toast(toastParam("Errore", error.response.data.data, "error"))
        }

    }

    useEffect(() => {
        setselectedFileAllenamento(acceptedFileAllenamento[0]);
    }, [acceptedFileAllenamento]);

    useEffect(() => {
        setisLoading(true);
        const getUsers = async () => {
            try {
                const {data: {data: {listaClienti}}} = await fetchContext.authAxios(urlUtenti);
                setOptions(listaClienti.map(e => {
                    return {value: e.id, label: e.nome}
                }))
                setisLoading(false);
            } catch (error) {
                console.log(error)
            }
        }
        getUsers();
    }, [fetchContext])

    useEffect(() => {
        setselectedFileAlimentare(acceptedFileAlimentare[0]);
    }, [acceptedFileAlimentare]);

    //Verifica se una data inserita è precedenta alla odierna
    function isValidDate(value) {
        return (!isNaN(Date.parse(value)) && (new Date(value) > Date.now()) ? true : "Inserisci una data valida");
    }

    return (
        <>
            <VStack w="full" h="full" p={[5, 10, 20]}>
                <Box bg={"white"} borderRadius='xl' pb={5} w={"full"}>
                    <GradientBar/>
                    <VStack spacing={3} alignItems="center" pb={5} mt={5}>
                        <Heading size="2xl">Crea Protocollo</Heading>
                        <form onSubmit={handleSubmit(onSubmit)} style={{width: "100%"}}>
                            <SimpleGrid columns={2} columnGap={5} rowGap={5} pl={[0, 5, 10]} pr={[0, 5, 10]} w="full">
                                <GridItem colSpan={2}>
                                    <FormControl id={"idCliente"}>
                                        <FormLabel>Cliente</FormLabel>
                                        <Select options={options} isLoading={isLoading} onChange={(e) => {
                                            setValue("idCliente", e.value)
                                        }}/>
                                    </FormControl>
                                </GridItem>
                                <GridItem colSpan={2}>
                                    <FormControl id={"dataScadenza"}>
                                        <FormLabel>Data Scadenza</FormLabel>
                                        <Input type="date" {...register("dataScadenza", {
                                            required: "La data di scadenza è obbligatoria", validate: value => {
                                                return isValidDate(value)
                                            }
                                        })} />
                                    </FormControl>
                                </GridItem>
                                <GridItem colSpan={2}>
                                    <FormControl id={"schedaAlimentare"}>
                                        <FormLabel>Scheda Alimentare</FormLabel>
                                        {selectedFileAlimentare != null && (
                                            <HStack>
                                                <CloseIcon cursor={"pointer"} color={"red"} onClick={() => {
                                                    setselectedFileAlimentare(null);
                                                    setValue("schedaAlimentare", null);
                                                }}/>
                                                <Text>
                                                    {selectedFileAlimentare.path}
                                                </Text>
                                            </HStack>)}
                                        {!selectedFileAlimentare && (
                                            <div {...getRootPropsAlimentare()}>
                                                <Box w={"full"} bg={"gray.50"} p={5} border={"dotted"}
                                                     borderColor={"gray.200"}>
                                                    <Input {...getInputPropsAlimentare()}/>
                                                    {
                                                        isDragActiveAlimentare ?
                                                            <p style={{color: "gray", textAlign: "center"}}>
                                                                Lascia il file qui ...
                                                            </p> :
                                                            <p style={{color: "gray", textAlign: "center"}}>
                                                                Clicca e trascina un file qui, oppure clicca per
                                                                selezionare un file
                                                            </p>
                                                    }
                                                </Box>
                                            </div>
                                        )}
                                    </FormControl>
                                </GridItem>
                                <GridItem colSpan={2}>
                                    <FormControl id={"fileAllenamento"}>
                                        <FormLabel>Scheda Allenamento</FormLabel>
                                        {selectedFileAllenamento != null && (
                                            <HStack>
                                                <CloseIcon cursor={"pointer"} color={"red"} onClick={() => {
                                                    setselectedFileAllenamento(null);
                                                    setValue("fileAllenamento", null);
                                                }}/>
                                                <Text>
                                                    {selectedFileAllenamento.path}
                                                </Text>
                                            </HStack>
                                        )}
                                        {!selectedFileAllenamento && (
                                            <div {...getRootPropsAllenamento()}>
                                                <Box w={"full"} bg={"gray.50"} p={5} border={"dotted"}
                                                     borderColor={"gray.200"}>
                                                    <Input {...getInputPropsAllenamento()}/>
                                                    {
                                                        isDragActiveAllenamento ?
                                                            <p style={{color: "gray", textAlign: "center"}}>
                                                                Lascia il file qui ...
                                                            </p> :
                                                            <p style={{color: "gray", textAlign: "center"}}>
                                                                Clicca e trascina un file qui, oppure clicca per
                                                                selezionare un file
                                                            </p>
                                                    }
                                                </Box>
                                            </div>
                                        )}
                                    </FormControl>
                                </GridItem>
                                <GridItem colSpan={2}>
                                    <Button type={"submit"}>Carica</Button>
                                </GridItem>
                            </SimpleGrid>
                        </form>
                    </VStack>
                </Box>
            </VStack>
        </>
    )
}

export default Create;