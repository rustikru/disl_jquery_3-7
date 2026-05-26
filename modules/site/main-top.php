                <div class="headerlt">
					<div class="headerrt">
							<form action="" method="post" class="logout">
								<div class="headerfullname">
									Здравствуйте, <?php echo $auth->getFullName();?>
								</div>
								<div class="logoutbtn">
									<input type="submit" name="logout" value="Выйти">
								</div>               
							</form>
					</div>
					<div class="headerstation">
						<ul class="menu">
							<?php 
								include('main-menu.php');
								echo get_main_menu($auth->getUserId(), $auth->getStationId()); 
							?>
						</ul>

					</div>
					<div id="msg_box" class="headermt" style="display: none;">
							Уважаемые пользователи, система будет остановлена на техническое обслуживание в 13.00 на 15 минут!  
					</div>
                </div>

