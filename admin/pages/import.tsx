import Layout from '../components/layout'
import Sidebar from '../components/sidebar'
import { useSession, signIn, signOut } from "next-auth/react"
import { Avatar, Button, Col, ConfigProvider, Input, List, message, Row, Switch, Table, Tabs } from 'antd'
import { ChangeEvent, KeyboardEvent, useEffect, useState } from 'react'
import { search } from '../lib/client/search'
import { RiSearchLine as SearchIcon } from 'react-icons/ri';
import useSWR from 'swr'
import TopTable from '../components/TopTable'
import { ColumnsType } from 'antd/lib/table'
import { match } from 'assert'

export default function Music() {
    const { data: session } = useSession()

    const [searchText,setSeachText] = useState("");   
    const [enteredText,setEnteredText] = useState("/Volumes/music/music/Artists/");   

    const [artistIndex,setArtistIndex] = useState(0);
    const [filteredArtists,setFilteredArtists] = useState([]);
    const [artists,setArtists] = useState([]);

    const [matches,setMatches] = useState([]);
    const [matchIndex,setMatchIndex] = useState(0);
    const [matchDetails,setMatchDetails] = useState(undefined);
    const [matchOverride,setMatchOverride] = useState("");
    const [albumIndex,setAlbumIndex] = useState(0);
    const [filteredAlbums,setFilteredAlbums] = useState([]);
    const [albums,setAlbums] = useState([]);

    const [filter,setFilter] = useState(false);

    const handleMatchOverrideChange = (e:ChangeEvent<HTMLInputElement>) => {
        setMatchOverride(e.target.value)
    }

    const handleFilterChange = (checked:boolean) => {
        setFilter(checked);
    }

    const handleSearch = async () => {
        setSeachText(enteredText);
    }
    const next = () => {
        if(albumIndex < filteredAlbums.length-1) {
            setAlbumSelection(albumIndex+1);
        } else {
            if (artistIndex < filteredArtists.length) {
                setArtistSelection(artistIndex+1);
            } else {
                setArtistSelection(0);
            }
            setAlbumIndex(0)
        }
    }

    const handleKeyPress = (event:KeyboardEvent) => {
        console.log(`Key pressed: ${event.key}`);
        if (!event.ctrlKey)
            return;
        switch(event.key) {
            case "s":
                saveAlbum();
                break;
            case "n":
            case "d":
                next();
                break;
            case "a":
                saveArtist();
                break;
        }

    };
    useEffect(()=> {
        if(filter)
            setFilteredArtists(artists.filter(hasUnsavedAlbums))
        else
            setFilteredArtists(artists)
    },[artists,filter]);
    useEffect(()=> {
        if(filter)
            setFilteredAlbums(albums.filter(a=>a.saved != true && a.name != "[Singles]"))
        else
        setFilteredAlbums(albums)
    },[albums,filter])

    
      useEffect(() => {
        // attach the event listener
        document.addEventListener('keydown', handleKeyPress as any);
    
        // remove the event listener
        return () => {
          document.removeEventListener('keydown', handleKeyPress as any);
        };
      }, [handleKeyPress]);


    const handleSearchChange = async (event:ChangeEvent<HTMLInputElement>) => {
        let text = (event.target as any).value;
        setEnteredText(text);
    }

    const fetchListings = async (searchTerm) => {
        let searchResponse = await fetch("/api/folderContent?q="+searchTerm);        
        setArtists(await searchResponse.json());
        setArtistSelection(0);
    }
    useEffect(() => {
        if(searchText == "")
            return;
        fetchListings(searchText);
    },[searchText])

    const fetchMatches = async(artistName,albumName) => {
        console.log("searching for",albumName)
        let results = await search(`${albumName} ${artistName}`,"album");
        setMatches(results.albums);
        setMatchIndex(0);
    }

    useEffect(()=> {
        if (matchOverride.length) {
            fetchMatches(matchOverride,"")
        }
        else if(albumIndex < filteredAlbums.length) {
            fetchMatches(filteredArtists[artistIndex].artist,filteredAlbums[albumIndex].name)
        }
    },[filteredAlbums,albumIndex,matchOverride])

  const customizeRenderEmpty = () => (<></>
  );
  const setArtistSelection = (index) => {
      setArtistIndex(index)
      setMatchOverride("");
      if(index < filteredArtists.length) {
        setAlbums(filteredArtists[index].albums)
        setAlbumSelection(0);
      }
  }
  const setAlbumSelection = (index) => {        
        setAlbumIndex(index);
    }

    const handleMatchSelection = (match,index) => {
        setMatchIndex(index);
    }
    const fetchMatchDetails = async (id) => {
        let searchResponse = await fetch("/api/music/album/"+id);        
        setMatchDetails(await searchResponse.json());

    }
    useEffect(()=> {
        if(matchIndex < matches.length) {
            fetchMatchDetails(matches[matchIndex].id);
        }
    },[matches,matchIndex])

    const hasUnsavedAlbums = (record) => {
        return record.albums.filter(r => r.saved != true && r.name != "[Singles]").length > 0
    }
    const markAlbum = async() => {
        message.loading({content:"saving...",key:"saveAlbum"});
        try {

            
            let saveRequest = await fetch("/api/music/album/mark",{
                method:"POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                  },
                body: JSON.stringify({
                    type:"album",
                    artist: filteredArtists[artistIndex].artist,
                    albumName: filteredAlbums[albumIndex].name,
                    library: searchText,
                })
            })
            filteredAlbums[albumIndex].saved = true;
            message.success({content:"Success",duration: 3,key:"saveAlbum"});
        } catch(e) {
            message.error({content:"Error",duration: 3,key:"saveAlbum"});
        }
    }
    const saveAlbum = async() => {
        message.loading({content:"saving...",key:"saveAlbum"});
        try {

            
            let saveRequest = await fetch("/api/music/mine",{
                method:"POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                  },
                body: JSON.stringify({
                    type:"album",
                    artist: filteredArtists[artistIndex].artist,
                    albumName: filteredAlbums[albumIndex].name,
                    library: searchText,
                    id:matches[matchIndex].id
                })
            })
            filteredAlbums[albumIndex].saved = true;
            message.success({content:"Success",duration: 3,key:"saveAlbum"});
        } catch(e) {
            message.error({content:"Error",duration: 3,key:"saveAlbum"});
        }
    }

 const saveArtist = async() => {
    message.loading({content:"saving...",key:"saveAlbum"});
    try {
        
        let saveRequest = await fetch("/api/music/mine",{
            method:"POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
            body: JSON.stringify({
                type:"artist",
                artist: filteredArtists[artistIndex].artist,
                albumName: filteredAlbums[albumIndex].name,
                library: searchText,
                id:matches[matchIndex].artists[0].id
            })
        })
        filteredAlbums[albumIndex].saved = true;
        message.success({content:"Success",duration: 3,key:"saveAlbum"});
    } catch(e) {
        message.error({content:"Error",duration: 3,key:"saveAlbum"});
    }     
 }
  const columns: ColumnsType<any> = [
    {
      title: 'Artist',
      dataIndex: 'artist',
      render: (text,record) => (hasUnsavedAlbums(record)?(<span style={{color:"red"}}>{record.artist}</span>):(<>{record.artist}</>))
    },
  ];
  const albumColumns: ColumnsType<any> = [
    {
      title: 'Album',
      dataIndex: 'name',
      render: (text,record) => (record.saved?(<>{record.name}</>):(<span style={{color:"red"}}>{record.name}</span>))
    },
  ];
  const matchColumns: ColumnsType<any> = [
    {
      title: 'Matches',
      dataIndex: 'name',
      render: (text,record) => (<>{record.name}</>)
    },
  ];
  return (
      <>
    <Row >
        <Col span={8}>
          <h2>Enter the path to your music</h2>
        <Row gutter={[5,20]} style={{flexWrap: "nowrap", }}>
            <Input style={{display:"inline", marginRight:10}} value={enteredText} onPressEnter={handleSearch} onChange={handleSearchChange}/>
            <Button style={{display:"inline"}} onClick={handleSearch} type="primary"><SearchIcon style={{marginTop:5, marginLeft:-3, marginRight:-3}} /></Button>
        </Row>
        <Switch size="small" checked={filter} onChange={handleFilterChange} /> Unmatched
        </Col>        
    </Row>
    <Row>
        <Col span={4}>
            <Table 
                pagination={{ pageSize: 500,  position: []}} 
                scroll={{ y: 600 }} 
            columns={columns} 
            rowKey="artist"
            
            rowSelection={{
                type:"radio",
                selectedRowKeys:filteredArtists.length? [filteredArtists[artistIndex].artist]:[]
            }}
            onRow={(record, rowIndex) => {
                return {
                  onClick: ()=> setArtistSelection(rowIndex)
                }}
            }
            dataSource={filteredArtists} />          
        </Col>
        <Col span={4}>
            <Table 
                pagination={{ pageSize: 500,  position: []}} 
                scroll={{ y: 1100 }} 
                columns={albumColumns} 
                rowKey="name"
                onRow={(record, rowIndex) => {
                    return {
                      onClick: ()=> setAlbumSelection(rowIndex)
                    }}
                }
                rowSelection={{
                    type:"radio",
                    selectedRowKeys:albumIndex < filteredAlbums.length? [filteredAlbums[albumIndex].name]:[]
                }}
                    dataSource={filteredAlbums} />          
        </Col>
        <Col span={4}>
            <Input value={matchOverride} onChange={handleMatchOverrideChange}/>
            <Table 
                pagination={{ pageSize: 500,  position: []}} 
                scroll={{ y: 600 }} 
                columns={matchColumns} 
                rowKey="id"
                rowSelection={{
                    type:"radio",
                    selectedRowKeys:matches.length? [matches[matchIndex].id]:[]
                }}
                    onRow={(record, rowIndex) => {
                    return {
                      onClick: ()=> handleMatchSelection(record,rowIndex)
                    }}
                }
                dataSource={matches} />                          
        </Col>
        <Col span={12}>
            <Row>
            <Col>
                <img src={matchDetails?.images[0].url} width="150" />
            </Col>
            <Col span={12} style={{paddingLeft: 10}}>
                <h1>{matchDetails?.name}</h1>      
                <h4 style={{marginTop:-10, marginBottom:10}}>{matchDetails?.artists && matchDetails?.artists.length? matchDetails?.artists[0].name:""}</h4>      
                <Button type="primary" disabled={matches.length == 0} onClick={saveAlbum}>Save Album</Button>
                &nbsp; 
                <Button  onClick={markAlbum}>Resolve</Button>
                &nbsp; 
                <Button  disabled={matches.length == 0} onClick={saveArtist}>Save Artist</Button>
            </Col>
            <Col>
            </Col>
            </Row>
        </Col>

    </Row>
    </>
  )
}

Music.getLayout = function getLayout(page) {
  return (
    <Layout selected='import'>{page}</Layout>
  )
}
