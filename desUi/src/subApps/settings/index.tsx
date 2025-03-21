import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { gql, useMutation } from "@apollo/client";
import { useToast } from "@/hooks/use-toast";
interface StoreData {
  name: string;
  type: string;
  number: string;
  password: string;
}

interface HandleChangeEvent {
  target: {
    id: string;
    value: string;
  };
}


const CREATE_VENDOR = gql`
  mutation CreateVendor($name: String!, $type: String!, $number: String!, $password: String!) {
    createVendor(input: {
      name: $name,
      type: $type,
      number: $number,
      password: $password
    }) {
      id
      name
      number
      type
    }
  }
`;

export default function Settings() {
  const [storeData, setStoreData] = useState({
    name: "",
    type: "VENDOR",
    number: "",
    password: ""
  });
  
  const { toast } = useToast();
  
  const [createVendor, { loading }] = useMutation(CREATE_VENDOR, {
    refetchQueries: ["listVendors"],

    onCompleted: (data) => {
      toast({
        title: "Success!",
        description: `Store "${data.createVendor.name}" has been created.`,
        variant: "default",
      });
      setStoreData({
        name: "",
        type: "VENDOR",
        number: "",
        password: ""
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });


  const handleChange = (e: HandleChangeEvent) => {
    const { id, value } = e.target;
    setStoreData((prevStoreData: StoreData) => ({ ...prevStoreData, [id]: value }));
  };

  const handleSubmit = () => {
    if (!storeData.name || !storeData.number || !storeData.password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    createVendor({
      variables: {
        name: storeData.name,
        type: storeData.type,
        number: storeData.number,
        password: storeData.password
      }
    });
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">CREATE VENDOR</h1>
      <Card>
        <CardHeader>
          <CardTitle>Store Setup</CardTitle>
          <CardDescription>Set up your vendor account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Store Name</Label>
            <Input 
              id="name" 
              placeholder="Enter your store name" 
              value={storeData.name}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="number">Phone Number</Label>
            <Input 
              id="number" 
              placeholder="Enter your phone number" 
              value={storeData.number}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="Set a password" 
              value={storeData.password}
              onChange={handleChange}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Store"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}