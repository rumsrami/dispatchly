import { makeStyles } from '@material-ui/core/styles';

export const useDashStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  title: {
    flexGrow: 1,
    fontFamily: theme.typography.fontFamily
  },
  appBar:{
    position: "sticky",
    backgroundColor: theme.palette.primary.main,
  },
  badge: {
    color: 'error'
  },
  boardContainer: {
    display: 'flex',
    width: '100%',
    marginTop: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
}));