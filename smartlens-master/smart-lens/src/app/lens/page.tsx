"use client";
import {
  Camera,
  CameraIcon,
  RefreshCcwDot,
  RefreshCcwIcon,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Webcam from "react-webcam";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import Link from "next/link";
import Image from "next/image";
import { AspectRatio } from "~/components/ui/aspect-ratio";
import { supabase } from "~/lib/utils";
import { trpc } from "~/lib/trpc";
import { ScrollArea } from "~/components/ui/scroll-area"




interface SearchResult {
  link: string;
}

interface APIResponse {
  class_name: string;
  confidence: number;
  // Add other properties as needed
}

interface SearchResult {
  link: string;
  title: string;
  snippet: string;
}

const Lens: React.FC = () => {
  const [cameraVisible, setCameraVisible] = useState(false);
  const [results, setResults] = useState<APIResponse[]>([]);
  const [image, setImage] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const webcamRef = useRef<Webcam>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const handleTakePhoto = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImage(imageSrc ?? undefined);
      setCameraVisible(false);
    }
  };

  const handleRetakePhoto = () => {
    setImage(undefined);
    setCameraVisible(true);
  };

  const base64ToBlob = (base64: string, contentType = "image/png") => {
    const base64String = base64.split(",")[1];
    if (!base64String) {
      throw new Error("Invalid base64 string");
    }
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  };

  const uploadToSupabase = async (): Promise<string | null> => {
    if (!image) {
      console.error("No image to upload");
      return null;
    }

    setUploading(true);

    try {
      const blob = base64ToBlob(image);
      const filePath = `public/${Date.now()}.jpg`;
      const { data, error } = await supabase.storage
        .from("Images")
        .upload(filePath, blob, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Upload failed:", error.message);
        throw new Error(error.message);
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("Images").getPublicUrl(filePath);

      if (publicUrl) {
        return publicUrl;
      } else {
        console.error("Failed to retrieve public URL");
        return null;
      }
    } catch (error) {
      console.error("Error during upload:", error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const mutation = trpc.detect.detectImage.useMutation();
  const searchMutation = trpc.search.searchByKeyword.useMutation();
  useEffect(() => {
    console.log("Results:", results);
  }, [results]);

  const handleViewResults = async () => {
    if (!image) return;

    setLoading(true);

    try {
      const imageUrl = await uploadToSupabase();

      if (!imageUrl) {
        console.error("Failed to get image URL");
        return;
      }

      const resultData: APIResponse[] = await mutation.mutateAsync({ imageUrl }) as APIResponse[];

      const identifiedObjects = resultData.map((response: APIResponse) => ({
        class_name: response.class_name,
      }));

      const searchResults: SearchResult[] = [];

      for (const obj of identifiedObjects) {
        const resultsForObj: SearchResult[] = await searchMutation.mutateAsync({
          query: obj.class_name,
        }) as SearchResult[];
      
        if (Array.isArray(resultsForObj)) {
          searchResults.push(...resultsForObj);
        } else {
          console.error("Unexpected response format:", resultsForObj);
        }
      }

      setResults(resultData);
      setSearchResults(searchResults);
    } catch (error) {
      console.error("Error:", error);
      setResults([]);
      setSearchResults([]);
    } finally {
      setLoading(false);
      setShowResults(true);
    }
  };

  const toggleFacingMode = () => {
    setFacingMode((prevMode) => (prevMode === "user" ? "environment" : "user"));
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-x-hidden px-10 dark:bg-background md:px-0">
      {!cameraVisible && !image && (
        <>
          <div className="mt-40 text-center md:mb-8 md:mt-0">
            <h1 className="m-4 text-4xl font-bold md:mb-4">Smart Lens</h1>
            <p className="text-lg text-primary">
              Capture and identify objects effortlessly.
            </p>
          </div>
          <div className="mb-12 grid grid-cols-1 gap-8 text-center md:grid-cols-3">
            <div>
              <Image
                src="/Capture.jpg"
                alt="Feature 1"
                className="mx-auto mb-4 rounded-3xl shadow-2xl shadow-black"
                width={200}
                height={200}
              />
              <h3 className="text-xl font-semibold">Feature 1</h3>
              <p className="text-primary">Capture photos with ease.</p>
            </div>
            <div>
              <Image
                src="/Identify.jpg"
                alt="Feature 2"
                className="mx-auto mb-4 rounded-3xl shadow-2xl shadow-black"
                width={200}
                height={200}
              />
              <h3 className="text-xl font-semibold">Feature 2</h3>
              <p className="text-primary">Identify objects instantly.</p>
            </div>
            <div>
              <Image
                src="/Accurate.jpg"
                alt="Feature 3"
                className="mx-auto mb-4 rounded-3xl shadow-2xl shadow-black"
                width={200}
                height={200}
              />
              <h3 className="text-xl font-semibold">Feature 3</h3>
              <p className="text-primary">Get accurate results quickly.</p>
            </div>
          </div>
          <Button onClick={() => setCameraVisible(true)} className="gap-2">
            <CameraIcon />
            <p className="hidden md:block">Open Camera</p>
          </Button>
        </>
      )}

      {cameraVisible && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="absolute inset-0 h-full w-full object-cover"
            videoConstraints={{ facingMode }}
            mirrored={false}
            screenshotQuality={1}
          />
          <div className="absolute bottom-0 flex w-1/2 justify-between p-4">
            <Button onClick={handleTakePhoto}>
              <Camera />
            </Button>
            <Button onClick={toggleFacingMode}>
              <RefreshCcwIcon />
            </Button>
          </div>
        </div>
      )}

      {image && !loading && !showResults && (
        <>
          <div className="my-10 hidden h-[30dvh] flex-col items-center md:mb-4 md:mt-8 md:flex md:h-[80dvh] md:w-1/2">
            <AspectRatio ratio={16 / 9} className="w-full">
              <Image
                src={image}
                alt="Captured preview"
                className="border-2 border-primary"
                fill
              />
            </AspectRatio>
            <div className="my-2 flex gap-4">
              <Button onClick={handleRetakePhoto}>Retake Photo</Button>
              <Button onClick={handleViewResults}>View Results</Button>
            </div>
          </div>
          <div className="my-10 flex h-[30dvh] flex-col items-center md:mb-4 md:mt-8 md:hidden md:h-[80dvh] md:w-1/2">
            <AspectRatio ratio={10 / 16} className="w-full">
              <Image
                src={image}
                alt="Captured preview"
                className="border-2 border-primary"
                fill
              />
            </AspectRatio>
            <div className="my-2 flex gap-4">
              <Button onClick={handleRetakePhoto}>Retake Photo</Button>
              <Button onClick={handleViewResults}>View Results</Button>
            </div>
          </div>
        </>
      )}

      {showResults && (
        <div className="relative m-10 flex h-full w-full flex-col md:flex-row">
          <motion.div
            className="hidden flex-col items-center justify-center bg-transparent md:flex md:w-1/2"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <AspectRatio ratio={16 / 9} className="w-full">
              <Image
                src={image ?? ""}
                alt="Captured Image"
                className="border-2 border-primary"
                fill
              />
            </AspectRatio>
            <Button
              onClick={() => {
                setShowResults(false);
                setResults([]);
                setImage(undefined);
                setCameraVisible(true);
              }}
              className="mt-4"
            >
              Retake
            </Button>
          </motion.div>
          <motion.div
            className=" my-10 md:hidden flex-col items-center justify-center bg-transparent  md:w-1/2"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <AspectRatio ratio={9 / 16} className="w-full">
              <Image
                src={image ?? ""}
                alt="Captured Image"
                className="border-2 border-primary"
                fill
              />
            </AspectRatio>
            <Button
              onClick={() => {
                setShowResults(false);
                setResults([]);
                setImage(undefined);
                setCameraVisible(true);
              }}
              className="mt-4 hidden"
            >
              Retake
            </Button>
          </motion.div>
          <motion.div
            className="w-full bg-transparent md:w-1/2"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Tabs
              defaultValue="objects"
              className="md:px-10"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="objects">Identified Objects</TabsTrigger>
                <TabsTrigger value="links">Links</TabsTrigger>
              </TabsList>
              <TabsContent value="objects" className="flex justify-center">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
              >
                {searchResults.length > 0 ? (
                  <ScrollArea className="h-[50dvh]  rounded-md px-4" >
                  <ul>
                    {results.map((result, index) => (
                      <li
                        key={index}
                        className="my-2 rounded border border-primary p-4"
                      >
                        
                          {result.class_name
                            .charAt(0)
                            .toUpperCase()
                            .concat(result.class_name.slice(1))}
                      </li>
                    ))}
                  </ul>
                  </ScrollArea>
                ) : (
                  <p>No search objects detected.</p>
                )}
              </motion.div>
            </TabsContent>
              <TabsContent value="links" className="flex justify-center">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
              >
                {searchResults.length > 0 ? (
                  <ScrollArea className="h-[50dvh]  rounded-md px-4" >
                  <ul>
                    {searchResults.map((result, index) => (
                      <li
                        key={index}
                        className="my-2 rounded border border-primary p-4"
                      >
                        <Link
                          href={result.link}
                          className="font-semibold text-primary underline"
                        >
                          {result.title}
                        </Link>
                        <p>{result.snippet}</p>
                      </li>
                    ))}
                  </ul>
                  </ScrollArea>
                ) : (
                  <p>No search results found.</p>
                )}
              </motion.div>
            </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      )}

      {loading && (
        <div className="flex h-[80dvh] w-full flex-col items-center justify-center gap-4">
          <RefreshCcwDot className="h-12 w-12 animate-spin" />
          <p>Processing your image...</p>
        </div>
      )}
    </div>
  );
};

export default Lens;
