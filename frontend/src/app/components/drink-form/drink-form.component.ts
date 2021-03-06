import {Component, OnInit} from '@angular/core';
import {DrinkService} from '../../service/drink.service';
import {LocationService} from '../../service/location.service';
import {ActivatedRoute, Router} from '@angular/router';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {Location} from '../../api/location';
import {AuthService} from '../../service/auth.service';

@Component({
  selector: 'app-drink-form',
  providers: [DrinkFormComponent],
  templateUrl: './drink-form.component.html',
  styleUrls: ['./drink-form.component.scss']
})
export class DrinkFormComponent implements OnInit {

  isLoggedIn: boolean;
  isAdmin: boolean;
  username: string;
  drinkForm;
  shouldNavigateToList: boolean;
  locationOptions: Array<Location>;
  loc: Location;
  cat: string;
  text: string;
  categories: Array<string> = ['Beer', 'Wine', 'Vodka', 'Gin', 'Liquor', 'Tequila', 'Soft drink'];
  message;

  constructor(private drinkService: DrinkService, private route: ActivatedRoute, private router: Router,
              private locationService: LocationService, private toastr: ToastrService, private authService: AuthService) {
    this.loadData();

  }

  static sorter(a: string, b: string) {
    const tA = a.toLowerCase();
    const tB = b.toLowerCase();
    return (tA < tB) ? -1 : (tA > tB) ? 1 : 0;
  }

  ngOnInit() {
    this.drinkForm = new FormGroup({
      'id': new FormControl(),
      'name': new FormControl([], [Validators.required, Validators.minLength(2), Validators.maxLength(25)]),
      'category': new FormControl([], [Validators.required]),
      'price': new FormControl([], [Validators.min(0), Validators.max(99999), Validators.required]),
      'age': new FormControl([], [Validators.required]),
      'rating': new FormControl(),
      'locationID': new FormControl([], [Validators.required]),
      'pictures': new FormControl([])
    });

    const data = this.route.snapshot.data;
    if (data.drink) {
      this.drinkForm.setValue(data.drink);
      this.locationService.getById(this.drinkForm.value.locationID).subscribe((val: any) => {
        this.loc = val;
      });
      this.cat = this.drinkForm.value.category;
    } else {
      this.locationService.getById('5').subscribe((val: any) => {
        this.loc = val;
        this.loc.name = 'Location';
      });
    }
    this.locationOptions = data.locations;
    this.locationOptions.sort((a, b) => DrinkFormComponent.sorter(a.name, b.name));
    this.categories.sort((a, b) => DrinkFormComponent.sorter(a, b));
    this.isAdmin = this.authService.isAdmin;
  }

  saveDrink() {
    const drinkToBeSafe = this.drinkForm.value;
    if (this.isAdmin) {
      if (drinkToBeSafe.id) {
        this.drinkService.update(drinkToBeSafe)
          .subscribe(() => {
            this.message = 'Successfully updated ' + this.drinkForm.value.name + '!';
            this.toastr.success(this.message, 'Message:');
            this.navigateToList();
          });
      } else {
        this.drinkService.create(drinkToBeSafe)
          .subscribe(() => {
            this.message = 'Successfully created ' + this.drinkForm.value.name + '!';
            this.toastr.success(this.message, 'Message:');
            this.navigateToList();
          });
      }
    } else {
      this.toastr.error('Not authorized!', 'Error:');
    }
  }

  setCategory(cat: string) {
    this.cat = cat;
    this.drinkForm.patchValue({category: cat});
  }

  setLocation(loc: Location) {
    this.loc = loc;
    this.drinkForm.patchValue({locationID: loc.id});
  }

  navigateToList() {
    if (this.shouldNavigateToList) {
      this.router.navigate(['/drink-list']);
    }
  }

  setShouldNavigateToList() {
    this.shouldNavigateToList = true;
  }

  private loadData() {
    this.isLoggedIn = this.authService.isLoggedIn;
    this.isAdmin = this.authService.isAdmin;
    this.username = this.authService.userName;
  }

}
