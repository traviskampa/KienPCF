import * as React from 'react';
import { Rating, RatingSize } from 'office-ui-fabric-react/lib/Rating';
import { getTheme, createTheme, ITheme } from 'office-ui-fabric-react/lib/Styling';


/*
By default, the font-based Fluent UI icons are not added to your bundle or loaded on the page, 
in order to save bytes for scenarios where you don't care about icons, or you only care about a subset.

To make the icons available, you may initialize them as follows. Note that initializeIcons() 
should only be called once per app and must be called before rendering any components. 
This is typically done in the app's top-level file just before the main ReactDOM.render() call.
*/

import { initializeIcons } from '@fluentui/react/lib/Icons';
initializeIcons(/* optional base url */);






const getRatingComponentAriaLabel = (rating: number, maxRating: number): string => {
    return `Rating value is ${rating} of ${maxRating}`;
}

const customTheme: ITheme = createTheme(getTheme());
customTheme.semanticColors.bodySubtext = '#DFDFDF';
customTheme.semanticColors.bodyTextChecked = '#1E9FE8';

export const RatingControl: React.FunctionComponent = () => {
    const [largeStarRating, setLargeStarsRating] = React.useState(1);
    const [smallStarRating, setSmallStarRating] = React.useState(3);
    const [tenStarRating, setTenStarRatingg] = React.useState(1);
    const [customIconStarRating, setCustomIconStarRating] = React.useState(2.5);
    const [themedStarRating, setThemedStarRating] = React.useState(1);
  
    const onLargeStarChange = (ev: React.FocusEvent<HTMLElement>, rating: number|undefined): void => {

        setLargeStarsRating(rating? rating: 0);
    };
  
    const onSmallStarChange = (ev: React.FocusEvent<HTMLElement>, rating: number|undefined): void => {
      setSmallStarRating(rating? rating: 0);
    };
  
    const onTenStarChange = (ev: React.FocusEvent<HTMLElement>, rating: number|undefined): void => {
      setTenStarRatingg(rating? rating: 0);
    };
    const onCustomIconStarChange = (ev: React.FocusEvent<HTMLElement>, rating: number|undefined): void => {
      setCustomIconStarRating(rating? rating: 0);
    };
    const onThemedStarChange = (ev: React.FocusEvent<HTMLElement>, rating: number|undefined): void => {
      setThemedStarRating(rating? rating: 0);
    };
  
    return (
      <div>
        Large Stars:
        <Rating
            min={1}
            max={5}
            size={RatingSize.Large}
            rating={largeStarRating}
            getAriaLabel={getRatingComponentAriaLabel}

            // eslint-disable-next-line react/jsx-no-bind
            onChange={onLargeStarChange}
            ariaLabelFormat={'Select {0} of {1} stars'} />

        Small Stars
        <Rating
            id="small"
            min={1}
            max={5}
            rating={smallStarRating}
            // eslint-disable-next-line react/jsx-no-bind
            onChange={onSmallStarChange}
            getAriaLabel={getRatingComponentAriaLabel}
            ariaLabelFormat={'Select {0} of {1} stars'}
            />
        10 Small Stars
        <Rating
            min={1}
            max={10}
            rating={tenStarRating}
            // eslint-disable-next-line react/jsx-no-bind
            onChange={onTenStarChange}
            getAriaLabel={getRatingComponentAriaLabel}
            ariaLabelFormat={'Select {0} of {1} stars'}
        />
        Disabled:
        <Rating min={1} max={5} rating={1} disabled={true} ariaLabelFormat={'Select {0} of {1} stars'} />
            Half star in readOnly mode:
            <Rating
            min={1}
            max={5}
            rating={2.5}
            getAriaLabel={getRatingComponentAriaLabel}
            readOnly
            ariaLabelFormat={'Select {0} of {1} stars'}
        />
        Custom icons:
        <Rating
            min={1}
            max={5}
            rating={customIconStarRating}
            // eslint-disable-next-line react/jsx-no-bind
            onChange={onCustomIconStarChange}
            getAriaLabel={getRatingComponentAriaLabel}
            ariaLabelFormat={'Select {0} of {1} stars'}
            icon="StarburstSolid"
            unselectedIcon="Starburst"
        />
        Themed star
        <Rating
            min={1}
            max={5}
            rating={themedStarRating}
            // eslint-disable-next-line react/jsx-no-bind
            onChange={onThemedStarChange}
            getAriaLabel={getRatingComponentAriaLabel}
            ariaLabelFormat={'Select {0} of {1} stars'}
            theme={customTheme}
        />



        </div>
    );
};

/*
export class RatingControl extends React.Component<{}, 
        { rating?: number; largeStarRating?: number; 
            smallStarRating?: number; tenStarRating?: number; 
            themedStarRating?: number; 
            customIconStarRating?: number;}> {
    
    private _customTheme: ITheme;

    constructor(props: {}) {
        super(props);
        this.state = {
            largeStarRating: undefined
        };

        this._customTheme = createTheme(getTheme());
        this._customTheme.semanticColors.bodySubtext = '#DFDFDF';
        this._customTheme.semanticColors.bodyTextChecked = '#1E9FE8';
    }

    public render(): JSX.Element {
        let currentRating = 2;
        
        return (
            <>
                <Rating
                    rating={currentRating}
                    max={5}
                    readOnly
                    allowZeroStars

                    // eslint-disable-next-line react/jsx-no-bind
                    //getAriaLabel={getRatingAriaLabel}
                    ariaLabelFormat={'Select {0} of {1} stars'}
                />
            </>
        );
    }

    private _onFocus = () => {};
    private _onBlur = () => {};

    private _onLargeStarChange = (ev: React.FocusEvent, rating: any): void => {
        this.setState({ largeStarRating: rating });
    };

    private _getRatingComponentAriaLabel(rating: number, maxRating: number): string {
        return `Rating value is ${rating} of ${maxRating}`;
    }

}

*/  
    
export default RatingControl

/*
To call this Rating control we need to add below code in init method of Index.ts file
    this._container = document.createElement(“div”);
    container.appendChild(this._container);
    ReactDOM.render( React.createElement(RatingControl), ,this._container );
*/