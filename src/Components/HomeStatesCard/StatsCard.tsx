// src/components/StatsCard.jsx

import { Box, Flex, Icon, Text } from '@chakra-ui/react';
import { FiUsers, FiDollarSign, FiBarChart2 } from 'react-icons/fi';

const getIcon = (type :any) => {
    switch (type) {
        case 'employees':
            return FiUsers;
        case 'value':
            return FiDollarSign;
        case 'operations':
            return FiBarChart2;
        default:
            return FiBarChart2;
    }
};

const ICON_GRADIENT = "linear-gradient(to top, var(--chakra-colors-side-c), var(--chakra-colors-side-a))";


export default function StatsCard({ title, value, unit, type } :any) {
    const CardIcon = getIcon(type);

    return (
        <Box
            bg="white"
            borderRadius="xl" 

            boxShadow="md"
            p={6} 
            flex="1" 
            minW="250px"
        >
            <Flex 
                justifyContent="space-between" 
                alignItems="center" 
                h="100px"
            >
                
                <Flex
                    w="48px"
                    h="48px"
                    borderRadius="md" // حواف دائرية خفيفة
                    justifyContent="center"
                    alignItems="center"
                    backgroundImage={ICON_GRADIENT}
                    boxShadow="lg"
                    flexShrink={0} // لضمان عدم تقلص حجمها
                >
                    <Icon as={CardIcon} boxSize={5} color="white" />
                </Flex>

               
                <Flex 
                    direction="column" 
                    alignItems="flex-start" 
                    alignSelf="flex-end'"
                    textAlign="right"

                    ml={4} 
                    mr={0}
                >
                    <Text fontSize="sm" color="gray.500" fontWeight="medium">
                        {title}
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold" color="gray.800" mt={1}>
                        {value} <Text as="span" fontSize="lg" fontWeight="normal" color="gray.600">{unit}</Text>
                    </Text>
                </Flex>
            </Flex>
        </Box>
    );
}