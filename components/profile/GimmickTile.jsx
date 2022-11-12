import Image from "next/image";
import { GimmickTileButton } from "../GimmickTileButton";

export const GimmickTile = ({ imageSRC, gimmickName, ppPunchAmount, openSeaLink, wikiLink, id }) => {
  return (
    <div>
      <Image src={`${process.env.NEXT_PUBLIC_API_URL}${imageSRC}`} alt={`Picture Of Gimmick: ${gimmickName}`} layout="responsive" width="1" height="1"/>
      <h4>{gimmickName}</h4>
      <div>
        {/* <Image /> */}
        <h6>{ppPunchAmount} Dickpunches</h6>
      </div>
      <div>
        <GimmickTileButton isOpenSea={true} link="" buttonText="View on MagicEden"/>
      </div>
      <div>
        <GimmickTileButton isWiki={true} link={`/wiki/gimmicks/${id}`} buttonText="View on Wiki" />
      </div>
    </div>
    
  )
}